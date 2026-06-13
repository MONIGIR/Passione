import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerStats,
} from "../controllers/usuarioController.js";
import { protect, soloAdmin } from "../middleware/authMiddleware.js";

/**
 * Enrutador de gestión de usuarios. Montado en `/api/usuarios`.
 * Rol arquitectónico: Enrutador de Express.
 *
 * Todas las rutas exigen JWT válido + rol admin (aplicado globalmente con
 * `router.use`), por lo que no es posible añadir una ruta pública por descuido.
 */
const router = express.Router();

// Todas las rutas de este router exigen JWT válido + rol admin
router.use(protect, soloAdmin);

/** @route GET /api/usuarios/stats · @desc Métricas del dashboard. */
router.get("/stats", obtenerStats);

/**
 * @route GET  /api/usuarios  · @desc Lista usuarios.
 * @route POST /api/usuarios  · @desc Crea usuario con rol asignable.
 */
router.route("/").get(obtenerUsuarios).post(crearUsuario);

/**
 * @route PUT    /api/usuarios/:id · @desc Actualiza usuario.
 * @route DELETE /api/usuarios/:id · @desc Elimina usuario (no a sí mismo).
 * @param {string} id ObjectId del usuario.
 */
router.route("/:id").put(actualizarUsuario).delete(eliminarUsuario);

export default router;
