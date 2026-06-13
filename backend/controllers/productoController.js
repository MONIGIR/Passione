import Producto from "../models/Producto.js";

/**
 * Lista productos con filtros opcionales, paginación y ordenamiento.
 *
 * @route   GET /api/productos
 * @access  Público
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.query
 * @param {string} [req.query.buscar]    Texto a buscar en nombre/sku/proveedor (regex, case-insensitive).
 * @param {string} [req.query.categoria] Filtro exacto por categoría.
 * @param {string} [req.query.activo]    `"true"|"false"`; se convierte a boolean.
 * @param {string} [req.query.enOferta]  `"true"|"false"`; se convierte a boolean.
 * @param {string} [req.query.ordenar="-createdAt"] Campo de orden Mongoose (p.ej. `"precio"`, `"-precio"`).
 * @param {string} [req.query.pagina="1"]  Número de página (1-based).
 * @param {string} [req.query.limite="20"] Tamaño de página.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, conteo:number, total:number,
 *   paginas:number, paginaActual:number, datos:ProductoDoc[] }`.
 * @throws {Error} Errores de DB → 500.
 *
 * [SEGURIDAD] `buscar` se pasa sin escapar a `$regex`: patrón malicioso puede
 * provocar ReDoS. Conviene escapar metacaracteres antes de construir el filtro.
 */
export const obtenerProductos = async (req, res, next) => {
  try {
    const {
      buscar,
      categoria,
      activo,
      enOferta,
      ordenar = "-createdAt",
      pagina = 1,
      limite = 20,
    } = req.query;

    const filtro = {};

    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: "i" } },
        { sku: { $regex: buscar, $options: "i" } },
        { proveedor: { $regex: buscar, $options: "i" } },
      ];
    }

    if (categoria) filtro.categoria = categoria;
    if (activo !== undefined) filtro.activo = activo === "true";
    if (enOferta !== undefined) filtro.enOferta = enOferta === "true";

    // Paginación
    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const total = await Producto.countDocuments(filtro);

    const productos = await Producto.find(filtro)
      .sort(ordenar)
      .skip(skip)
      .limit(parseInt(limite));

    res.json({
      exito: true,
      conteo: productos.length,
      total,
      paginas: Math.ceil(total / parseInt(limite)),
      paginaActual: parseInt(pagina),
      datos: productos,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un producto por su ObjectId.
 *
 * @route   GET /api/productos/:id
 * @access  Público
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.params
 * @param {string} req.params.id  ObjectId del producto.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, datos:ProductoDoc }`.
 * @throws {Error} 404 si no existe; `CastError` (500) si el id no es un ObjectId válido.
 */
export const obtenerProductoPorId = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      res.status(404);
      throw new Error("Producto no encontrado");
    }

    res.json({ exito: true, datos: producto });
  } catch (error) {
    next(error);
  }
};

/**
 * Crea un nuevo producto. Verifica unicidad de SKU antes de insertar.
 *
 * @route   POST /api/productos
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.body  Campos del ProductoDoc (nombre, sku, precio, stock, etc.).
 * @param {string} req.body.sku  SKU; se compara en mayúsculas contra el catálogo.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 201 + `{ exito:true, mensaje:string, datos:ProductoDoc }`.
 * @throws {Error} 400 si el SKU ya existe; errores de validación del schema → 500.
 *
 * [SEGURIDAD] Mass assignment: `Producto.create(req.body)` inserta el body
 * completo. Mongoose descarta campos fuera del schema, pero conviene whitelizar
 * los campos permitidos explícitamente.
 */
export const crearProducto = async (req, res, next) => {
  try {
    // Verificar si el SKU ya existe
    const skuExistente = await Producto.findOne({ sku: req.body.sku?.toUpperCase() });
    if (skuExistente) {
      res.status(400);
      throw new Error(`El SKU "${req.body.sku}" ya está registrado`);
    }

    const producto = await Producto.create(req.body);

    res.status(201).json({
      exito: true,
      mensaje: "Producto creado exitosamente",
      datos: producto,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza un producto por id, ejecutando las validaciones del schema.
 *
 * @route   PUT /api/productos/:id
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.params
 * @param {string} req.params.id  ObjectId del producto.
 * @param {Object} req.body       Campos a actualizar (parcial).
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, mensaje:string, datos:ProductoDoc }`
 *   (documento ya actualizado por `new:true`).
 * @throws {Error} 404 si no existe; errores de validación (`runValidators:true`) → 500.
 *
 * [SEGURIDAD] Mass assignment vía `req.body` sin whitelist (mismo caso que crear).
 */
export const actualizarProducto = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      res.status(404);
      throw new Error("Producto no encontrado");
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,          // Devolver el documento actualizado
        runValidators: true, // Ejecutar las validaciones del schema
      }
    );

    res.json({
      exito: true,
      mensaje: "Producto actualizado exitosamente",
      datos: productoActualizado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina físicamente un producto por id.
 *
 * @route   DELETE /api/productos/:id
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.params
 * @param {string} req.params.id  ObjectId del producto.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, mensaje:string }`.
 * @throws {Error} 404 si no existe. DB → 500.
 *
 * [REQUIERE CLARIFICACIÓN DE LÓGICA] Borrado físico (hard delete) pese a existir
 * el flag `activo` para soft delete. Las órdenes referencian este producto por
 * ObjectId; tras el borrado, ese `ref` queda colgando (los snapshots de la orden
 * conservan los datos, pero el `populate` devolvería null).
 */
export const eliminarProducto = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      res.status(404);
      throw new Error("Producto no encontrado");
    }

    await Producto.findByIdAndDelete(req.params.id);

    res.json({
      exito: true,
      mensaje: `Producto "${producto.nombre}" eliminado correctamente`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista productos activos cuyo stock está en o por debajo del mínimo.
 *
 * @route   GET /api/productos/reportes/stock-bajo
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, conteo:number, datos:ProductoDoc[] }`
 *   ordenados por stock ascendente.
 * @throws {Error} Errores de DB → 500.
 */
export const obtenerStockBajo = async (req, res, next) => {
  try {
    const productos = await Producto.find({
      activo: true,
      $expr: { $lte: ["$stock", "$stockMinimo"] },
    }).sort({ stock: 1 });

    res.json({
      exito: true,
      conteo: productos.length,
      datos: productos,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resumen financiero del inventario: totales globales y desglose por categoría,
 * calculados con pipelines de agregación de MongoDB.
 *
 * @route   GET /api/productos/reportes/resumen
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, datos:{
 *   general:{ totalProductos, totalUnidades, valorInventario, precioPromedio,
 *             stockPromedio, productosStockBajo },
 *   porCategoria: Array<{ categoria, cantidad, unidades, valor }> } }`.
 * @throws {Error} Errores de DB → 500.
 */
export const obtenerResumen = async (req, res, next) => {
  try {
    const [resumen] = await Producto.aggregate([
      { $match: { activo: true } },
      {
        $group: {
          _id: null,
          totalProductos: { $sum: 1 },
          totalUnidades: { $sum: "$stock" },
          valorInventario: { $sum: { $multiply: ["$precio", "$stock"] } },
          precioPromedio: { $avg: "$precio" },
          stockPromedio: { $avg: "$stock" },
        },
      },
    ]);

    const stockBajo = await Producto.countDocuments({
      activo: true,
      $expr: { $lte: ["$stock", "$stockMinimo"] },
    });

    const porCategoria = await Producto.aggregate([
      { $match: { activo: true } },
      {
        $group: {
          _id: "$categoria",
          cantidad: { $sum: 1 },
          unidades: { $sum: "$stock" },
          valor: { $sum: { $multiply: ["$precio", "$stock"] } },
        },
      },
      { $sort: { valor: -1 } },
    ]);

    res.json({
      exito: true,
      datos: {
        general: {
          totalProductos: resumen?.totalProductos || 0,
          totalUnidades: resumen?.totalUnidades || 0,
          valorInventario: resumen?.valorInventario || 0,
          precioPromedio: resumen?.precioPromedio || 0,
          stockPromedio: resumen?.stockPromedio || 0,
          productosStockBajo: stockBajo,
        },
        porCategoria: porCategoria.map((c) => ({
          categoria: c._id,
          cantidad: c.cantidad,
          unidades: c.unidades,
          valor: parseFloat(c.valor.toFixed(2)),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
