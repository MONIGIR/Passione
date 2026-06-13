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

const router = express.Router();

// Reportes — solo admins
router.get("/reportes/stock-bajo", protect, soloAdmin, obtenerStockBajo);
router.get("/reportes/resumen",    protect, soloAdmin, obtenerResumen);

// Catálogo público (GET) / escritura solo admin
router.route("/")
  .get(obtenerProductos)
  .post(protect, soloAdmin, crearProducto);

router.route("/:id")
  .get(obtenerProductoPorId)
  .put(protect, soloAdmin, actualizarProducto)
  .delete(protect, soloAdmin, eliminarProducto);

export default router;
