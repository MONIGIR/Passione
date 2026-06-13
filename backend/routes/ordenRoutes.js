import express from "express";
import { crearOrden, obtenerOrdenes, actualizarOrden } from "../controllers/ordenController.js";
import { protect, soloAdmin } from "../middleware/authMiddleware.js";

/**
 * Enrutador de órdenes. Montado en `/api/ordenes`.
 * Rol arquitectónico: Enrutador de Express.
 *
 * El alta de orden requiere usuario autenticado; el listado y el cambio de
 * estado requieren además rol admin. No expone DELETE: las órdenes no se
 * eliminan, sólo se cancelan (soft delete por estado).
 */
const router = express.Router();

/** @route POST /api/ordenes     · @access Usuario autenticado · @desc Checkout. */
router.post("/",     protect,              crearOrden);     // usuario compra
/** @route GET  /api/ordenes     · @access Admin · @desc Lista todas las órdenes. */
router.get("/",      protect, soloAdmin,   obtenerOrdenes); // admin lista
/** @route PUT  /api/ordenes/:id · @access Admin · @desc Cambia estado. @param {string} id */
router.put("/:id",   protect, soloAdmin,   actualizarOrden);// admin cambia estado

export default router;
