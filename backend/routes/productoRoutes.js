import express from "express";
import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerStockBajo,
  obtenerResumen,
} from "../controllers/productoController.js";
import { protect, soloAdmin } from "../middleware/authMiddleware.js";

/**
 * Enrutador de catálogo/inventario. Montado en `/api/productos`.
 * Rol arquitectónico: Enrutador de Express.
 *
 * GET del catálogo es público; toda escritura y los reportes exigen admin.
 * Las rutas `/reportes/*` se declaran ANTES de `/:id` para que `"reportes"` no
 * sea capturado como un id (evita un `CastError` en `findById`).
 */
const router = express.Router();

// Reportes — solo admins
/** @route GET /api/productos/reportes/stock-bajo · @access Admin */
router.get("/reportes/stock-bajo", protect, soloAdmin, obtenerStockBajo);
/** @route GET /api/productos/reportes/resumen · @access Admin */
router.get("/reportes/resumen",    protect, soloAdmin, obtenerResumen);

/**
 * @route GET  /api/productos · @desc Catálogo con filtros/paginación. @access Público
 * @route POST /api/productos · @desc Crea producto. @access Admin
 */
router.route("/")
  .get(obtenerProductos)
  .post(protect, soloAdmin, crearProducto);

/**
 * @route GET    /api/productos/:id · @desc Detalle. @access Público
 * @route PUT    /api/productos/:id · @desc Actualiza. @access Admin
 * @route DELETE /api/productos/:id · @desc Elimina. @access Admin
 * @param {string} id ObjectId del producto.
 */
router.route("/:id")
  .get(obtenerProductoPorId)
  .put(protect, soloAdmin, actualizarProducto)
  .delete(protect, soloAdmin, eliminarProducto);

export default router;
