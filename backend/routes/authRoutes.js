import express from "express";
import { body } from "express-validator";
import { registro, login, logout, getMe, actualizarPerfil } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

/**
 * Enrutador de autenticación. Montado en `/api/auth`.
 * Rol arquitectónico: Enrutador de Express.
 *
 * Dependencias: express-validator (validación de body), controlador de auth,
 * middleware `protect` para rutas privadas.
 */
const router = express.Router();

/**
 * @route POST /api/auth/registro
 * @desc  Alta de usuario. Valida nombre/email/password con express-validator.
 * @body  {string} nombre, {string} email, {string} password (≥ 8)
 */
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

/**
 * @route POST /api/auth/login
 * @desc  Inicio de sesión. Valida formato de email y presencia de password.
 * @body  {string} email, {string} password
 */
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  login
);

/** @route POST /api/auth/logout · @desc Cierra sesión (borra cookie). Público. */
router.post("/logout", logout);

// Rutas protegidas: requieren cookie JWT válida (middleware protect)
/** @route GET /api/auth/me · @desc Usuario autenticado actual. */
router.get("/me",     protect, getMe);
/** @route PUT /api/auth/perfil · @desc Actualiza perfil propio. */
router.put("/perfil", protect, actualizarPerfil);

export default router;
