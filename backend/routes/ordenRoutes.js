import express from "express";
import { crearOrden, obtenerOrdenes, actualizarOrden } from "../controllers/ordenController.js";
import { protect, soloAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",     protect,              crearOrden);     // usuario compra
router.get("/",      protect, soloAdmin,   obtenerOrdenes); // admin lista
router.put("/:id",   protect, soloAdmin,   actualizarOrden);// admin cambia estado

export default router;
