import Producto from "../models/Producto.js";

// ──────────────────────────────────────────────
// @desc    Obtener todos los productos (con filtros opcionales)
// @route   GET /api/productos
// @query   ?buscar=laptop&categoria=Electrónica&activo=true&ordenar=precio&pagina=1&limite=10
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// @desc    Obtener un producto por ID
// @route   GET /api/productos/:id
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// @desc    Crear un nuevo producto
// @route   POST /api/productos
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// @desc    Actualizar un producto
// @route   PUT /api/productos/:id
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// @desc    Eliminar un producto
// @route   DELETE /api/productos/:id
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// @desc    Obtener productos con stock bajo
// @route   GET /api/productos/reportes/stock-bajo
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// @desc    Obtener resumen/estadísticas del inventario
// @route   GET /api/productos/reportes/resumen
// ──────────────────────────────────────────────
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