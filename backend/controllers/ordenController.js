import Orden from "../models/Orden.js";
import Producto from "../models/Producto.js";

/**
 * Crea una orden (checkout). Implementa una transacción manual en 6 pasos:
 * valida el carrito, trae los productos en una sola query, valida stock,
 * decrementa stock de forma atómica por documento con rollback manual ante
 * agotamiento concurrente, construye snapshots de precio y persiste la orden.
 *
 * @route   POST /api/ordenes
 * @access  Privado (requiere `protect`)
 * @async
 * @param {import("express").Request} req  Lee `req.usuario` (comprador, vía `protect`).
 * @param {Object} req.body
 * @param {Array<{productoId:string, cantidad:number}>} req.body.items  Líneas del carrito.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 201 + `{ exito:true, datos:OrdenDoc }`.
 * @throws {Error} 400 si el carrito está vacío o un producto no existe/está inactivo;
 *   409 si el stock es insuficiente o se agota durante el proceso (con rollback). DB → 500.
 *
 * [SEGURIDAD/LÓGICA — REQUIERE CLARIFICACIÓN] No se validan tipos de `productoId`
 * ni `cantidad`:
 *   - `productoId` como objeto podría inyectarse en el `$in`/`findOneAndUpdate`.
 *   - Una `cantidad` negativa hace que `{ stock: { $gte: cantidad } }` siempre pase
 *     y que `$inc: { stock: -cantidad }` AUMENTE el stock, además de producir
 *     `subtotal`/`total` negativos. Debe validarse `cantidad` entero ≥ 1.
 * [RENDIMIENTO] El decremento y el rollback son bucles secuenciales de queries
 * (N llamadas); sin transacción de MongoDB el rollback no es atómico.
 */
export const crearOrden = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ productoId, cantidad }]

    if (!items || items.length === 0) {
      res.status(400);
      return next(new Error("El carrito está vacío"));
    }

    // 1. Traer todos los productos de un solo viaje a la DB
    const ids = items.map(i => i.productoId);
    const productos = await Producto.find({ _id: { $in: ids }, activo: { $ne: false } });

    // 2. Validar existencia y stock suficiente antes de modificar nada
    for (const item of items) {
      const prod = productos.find(p => p._id.toString() === item.productoId);
      if (!prod) {
        res.status(400);
        return next(new Error(`Producto no encontrado o inactivo: ${item.productoId}`));
      }
      if (prod.stock < item.cantidad) {
        res.status(409);
        return next(
          new Error(`Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}`)
        );
      }
    }

    // 3. Decrementar stock de forma atómica (operación $inc con condición en el mismo query)
    //    Si entre la validación y aquí alguien compró el último stock, el update devolverá null.
    const decrementados = [];
    for (const item of items) {
      const actualizado = await Producto.findOneAndUpdate(
        { _id: item.productoId, stock: { $gte: item.cantidad } },
        { $inc: { stock: -item.cantidad } },
        { new: true }
      );
      if (!actualizado) {
        // Revertir los decrementos ya realizados (rollback manual)
        for (const d of decrementados) {
          await Producto.findByIdAndUpdate(d.id, { $inc: { stock: d.cantidad } });
        }
        res.status(409);
        return next(
          new Error("Stock agotado mientras procesabas la compra. Revisa tu carrito.")
        );
      }
      decrementados.push({ id: item.productoId, cantidad: item.cantidad });
    }

    // 4. Construir snapshot de items (precios al momento de la compra)
    const itemsOrden = items.map(item => {
      const prod = productos.find(p => p._id.toString() === item.productoId);
      const precioFinal =
        prod.enOferta && prod.descuento > 0
          ? parseFloat((prod.precio * (1 - prod.descuento / 100)).toFixed(2))
          : prod.precio;
      return {
        producto:    prod._id,
        nombre:      prod.nombre,
        sku:         prod.sku,
        imageUrl:    prod.imageUrl || "",
        precio:      prod.precio,
        precioFinal,
        cantidad:    item.cantidad,
        subtotal:    parseFloat((precioFinal * item.cantidad).toFixed(2)),
      };
    });

    const total = parseFloat(
      itemsOrden.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)
    );

    // 5. Persistir la orden
    const orden = await Orden.create({
      usuario:       req.usuario._id,
      nombreCliente: req.usuario.nombre,
      emailCliente:  req.usuario.email,
      items:         itemsOrden,
      total,
    });

    res.status(201).json({ exito: true, datos: orden });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista todas las órdenes del sistema, más recientes primero.
 *
 * @route   GET /api/ordenes
 * @access  Privado · Admin (`protect, soloAdmin`)
 * @async
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, conteo:number, datos:OrdenDoc[] }`.
 * @throws {Error} Errores de DB → 500.
 *
 * [RENDIMIENTO] Sin paginación: carga todas las órdenes en memoria.
 */
export const obtenerOrdenes = async (req, res, next) => {
  try {
    const ordenes = await Orden.find().sort({ createdAt: -1 });
    res.json({ exito: true, conteo: ordenes.length, datos: ordenes });
  } catch (error) {
    next(error);
  }
};

/**
 * Cambia el estado de una orden. Al transicionar a `"cancelado"` (y sólo en la
 * transición, no si ya estaba cancelada) restaura el stock de cada ítem.
 *
 * @route   PUT /api/ordenes/:id
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.params
 * @param {string} req.params.id  ObjectId de la orden.
 * @param {Object} req.body
 * @param {"pendiente"|"procesando"|"enviado"|"completado"|"cancelado"} req.body.estado  Nuevo estado.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, datos:OrdenDoc }`.
 * @throws {Error} 400 si el estado no es válido; 404 si la orden no existe. DB → 500.
 *
 * [RENDIMIENTO] La restauración de stock es un bucle secuencial de updates sin
 * transacción (mismo patrón que el rollback de `crearOrden`).
 */
export const actualizarOrden = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ["pendiente", "procesando", "enviado", "completado", "cancelado"];
    if (!estadosValidos.includes(estado)) {
      res.status(400);
      return next(new Error(`Estado inválido: ${estado}`));
    }

    const orden = await Orden.findById(req.params.id);
    if (!orden) {
      res.status(404);
      return next(new Error("Orden no encontrada"));
    }

    // Restaurar stock solo si estamos CAMBIANDO a cancelado (no si ya estaba cancelado)
    if (estado === "cancelado" && orden.estado !== "cancelado") {
      for (const item of orden.items) {
        await Producto.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } });
      }
    }

    orden.estado = estado;
    await orden.save();

    res.json({ exito: true, datos: orden });
  } catch (error) {
    next(error);
  }
};
