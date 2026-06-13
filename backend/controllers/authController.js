import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";

const COOKIE_OPTS = {
  httpOnly: true,                              // JS del browser nunca puede leerla
  secure: process.env.NODE_ENV === "production", // HTTPS en prod, HTTP en dev
  sameSite: "strict",                          // Protección CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 días en ms
};

const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const respuestaUsuario = (usuario) => ({
  _id: usuario._id,
  nombre: usuario.nombre,
  email: usuario.email,
  role: usuario.role,
});

// @route   POST /api/auth/registro
export const registro = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    res.status(400);
    return next(new Error(errores.array()[0].msg));
  }

  try {
    const { nombre, email, password } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) {
      res.status(400);
      return next(new Error("El email ya está registrado"));
    }

    const usuario = await Usuario.create({ nombre, email, password });
    const token = generarToken(usuario._id);

    res
      .status(201)
      .cookie("token", token, COOKIE_OPTS)
      .json({ exito: true, datos: respuestaUsuario(usuario) });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    res.status(400);
    return next(new Error(errores.array()[0].msg));
  }

  try {
    const { email, password } = req.body;

    // Necesitamos el password explícitamente porque tiene select:false en el schema
    const usuario = await Usuario.findOne({ email }).select("+password");

    if (!usuario || !(await usuario.compararPassword(password))) {
      res.status(401);
      return next(new Error("Email o contraseña incorrectos"));
    }

    if (!usuario.activo) {
      res.status(403);
      return next(new Error("Cuenta desactivada. Contacta al administrador."));
    }

    const token = generarToken(usuario._id);

    res
      .cookie("token", token, COOKIE_OPTS)
      .json({ exito: true, datos: respuestaUsuario(usuario) });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/logout
export const logout = (req, res) => {
  res
    .cookie("token", "", { ...COOKIE_OPTS, maxAge: 0 })
    .json({ exito: true, mensaje: "Sesión cerrada" });
};

// @route   GET /api/auth/me
// Endpoint para que el frontend verifique si hay sesión activa al recargar la página
export const getMe = async (req, res) => {
  res.json({ exito: true, datos: respuestaUsuario(req.usuario) });
};
