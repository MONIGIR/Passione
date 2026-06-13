import Orden from "../models/Orden.js";
import Producto from "../models/Producto.js";

// ─────────────────────────────────────────────────────────────
// POST /api/ordenes  — usuario autenticado finaliza compra
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// GET /api/ordenes  — admin: todas las órdenes
// ─────────────────────────────────────────────────────────────
export const obtenerOrdenes = async (req, res, next) => {
  try {
    const ordenes = await Orden.find().sort({ createdAt: -1 });
    res.json({ exito: true, conteo: ordenes.length, datos: ordenes });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/ordenes/:id  — admin: cambia estado
//   Si el nuevo estado es "cancelado" → restaura el stock
// ─────────────────────────────────────────────────────────────
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
