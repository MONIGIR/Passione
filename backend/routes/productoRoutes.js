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

const router = express.Router();

// ⚠️ Las rutas específicas SIEMPRE van antes que las rutas con parámetros (:id)
router.get("/reportes/stock-bajo", obtenerStockBajo);
router.get("/reportes/resumen", obtenerResumen);

// CRUD estándar
router.route("/")
  .get(obtenerProductos)
  .post(crearProducto);

router.route("/:id")
  .get(obtenerProductoPorId)
  .put(actualizarProducto)
  .delete(eliminarProducto);

export default router;