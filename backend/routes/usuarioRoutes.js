import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerStats,
} from "../controllers/usuarioController.js";
import { protect, soloAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas de este router exigen JWT válido + rol admin
router.use(protect, soloAdmin);

router.get("/stats", obtenerStats);
router.route("/").get(obtenerUsuarios).post(crearUsuario);
router.route("/:id").put(actualizarUsuario).delete(eliminarUsuario);

export default router;
