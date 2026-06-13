import express from "express";
import { body } from "express-validator";
import { registro, login, logout, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/registro",
  [
    body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("La contraseña debe tener al menos 8 caracteres"),
  ],
  registro
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  login
);

router.post("/logout", logout);

// Ruta protegida: requiere cookie válida
router.get("/me", protect, getMe);

export default router;
