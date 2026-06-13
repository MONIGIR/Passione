import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";

/**
 * Opciones compartidas para la cookie de sesión `token`.
 * @constant
 * @type {{httpOnly:boolean, secure:boolean, sameSite:string, maxAge:number}}
 * @property {boolean} httpOnly  El JS del navegador no puede leerla (mitiga XSS).
 * @property {boolean} secure    Sólo se envía por HTTPS en producción.
 * @property {string}  sameSite  `"strict"` → mitiga CSRF.
 * @property {number}  maxAge    Vida útil en ms (7 días).
 */
const COOKIE_OPTS = {
  httpOnly: true,                              // JS del browser nunca puede leerla
  secure: process.env.NODE_ENV === "production", // HTTPS en prod, HTTP en dev
  sameSite: "strict",                          // Protección CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 días en ms
};

/**
 * Firma un JWT (HS256) cuyo payload contiene únicamente el id del usuario.
 * Mantener sólo `{ id }` permite que cambios de rol surtan efecto sin esperar
 * a que expire el token (el rol se relee en `protect`).
 *
 * @param {string|mongoose.Types.ObjectId} id  Identificador del usuario.
 * @returns {string} JWT firmado con `JWT_SECRET` y expiración `JWT_EXPIRES_IN`.
 */
const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * Proyección segura (allow-list) de los campos públicos de un usuario.
 * Garantiza que `password`, `activo`, timestamps, etc. nunca lleguen al cliente.
 *
 * @param {import("../models/Usuario.js").default} usuario Documento Usuario.
 * @returns {{_id:any, nombre:string, email:string, role:string}}
 */
const respuestaUsuario = (usuario) => ({
  _id: usuario._id,
  nombre: usuario.nombre,
  email: usuario.email,
  role: usuario.role,
});

/**
 * Registra un nuevo usuario y abre sesión devolviendo la cookie JWT.
 *
 * @route   POST /api/auth/registro
 * @access  Público
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.body
 * @param {string} req.body.nombre   Nombre del usuario.
 * @param {string} req.body.email    Email (validado/normalizado por express-validator).
 * @param {string} req.body.password Contraseña en texto plano (mín. 8 chars).
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 201 + cookie `token` + `{ exito:true, datos:{_id,nombre,email,role} }`.
 * @throws {Error} 400 si la validación falla o el email ya existe.
 *   Otros errores (DB) se delegan al `errorHandler` vía `next(error)` (500).
 */
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

/**
 * Autentica al usuario y abre sesión devolviendo la cookie JWT.
 *
 * @route   POST /api/auth/login
 * @access  Público
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.body
 * @param {string} req.body.email    Email (validado/normalizado por express-validator).
 * @param {string} req.body.password Contraseña en texto plano.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + cookie `token` + `{ exito:true, datos:{_id,nombre,email,role} }`.
 * @throws {Error} 401 si las credenciales son incorrectas (usuario inexistente o
 *   password no coincide); 403 si la cuenta está desactivada. Errores de DB → 500.
 */
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

/**
 * Cierra la sesión sobreescribiendo la cookie `token` con valor vacío y
 * `maxAge:0`, lo que instruye al navegador a eliminarla. No requiere auth.
 *
 * @route   POST /api/auth/logout
 * @access  Público
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void} 200 + cookie expirada + `{ exito:true, mensaje:string }`.
 */
export const logout = (req, res) => {
  res
    .cookie("token", "", { ...COOKIE_OPTS, maxAge: 0 })
    .json({ exito: true, mensaje: "Sesión cerrada" });
};

/**
 * Devuelve los datos del usuario autenticado. Sirve para restaurar la sesión
 * tras recargar la app. La autenticación la resuelve `protect`.
 *
 * @route   GET /api/auth/me
 * @access  Privado (requiere `protect`)
 * @async
 * @param {import("express").Request} req  Lee `req.usuario` (poblado por `protect`).
 * @param {import("express").Response} res
 * @returns {Promise<void>} 200 + `{ exito:true, datos:{_id,nombre,email,role} }`.
 */
export const getMe = async (req, res) => {
  res.json({ exito: true, datos: respuestaUsuario(req.usuario) });
};

/**
 * Actualiza el perfil del propio usuario. Los cambios sensibles (email o
 * contraseña) exigen la contraseña actual. El campo `role` nunca se modifica
 * desde este endpoint (anti escalada de privilegios).
 *
 * @route   PUT /api/auth/perfil
 * @access  Privado (requiere `protect`)
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.body
 * @param {string} [req.body.nombre]         Nuevo nombre (cambio no sensible).
 * @param {string} [req.body.email]          Nuevo email (cambio sensible).
 * @param {string} [req.body.passwordActual] Contraseña actual; requerida si hay cambio sensible.
 * @param {string} [req.body.nuevoPassword]  Nueva contraseña (cambio sensible, mín. 8 chars).
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, datos:{_id,nombre,email,role} }`.
 * @throws {Error} 400 si falta `passwordActual` ante un cambio sensible o la nueva
 *   contraseña es < 8 chars; 401 si `passwordActual` es incorrecta. Errores de DB → 500.
 */
export const actualizarPerfil = async (req, res, next) => {
  try {
    const { nombre, email, passwordActual, nuevoPassword } = req.body;

    const cambioSensible = email || nuevoPassword;

    if (cambioSensible) {
      if (!passwordActual) {
        res.status(400);
        return next(new Error("Se requiere la contraseña actual para cambiar email o contraseña"));
      }
      const usuarioConPw = await Usuario.findById(req.usuario._id).select("+password");
      const valida = await usuarioConPw.compararPassword(passwordActual);
      if (!valida) {
        res.status(401);
        return next(new Error("Contraseña actual incorrecta"));
      }
      if (nuevoPassword && nuevoPassword.length < 8) {
        res.status(400);
        return next(new Error("La nueva contraseña debe tener al menos 8 caracteres"));
      }
    }

    const usuario = await Usuario.findById(req.usuario._id);
    if (nombre)          usuario.nombre   = nombre.trim();
    if (email)           usuario.email    = email.toLowerCase().trim();
    if (nuevoPassword)   usuario.password = nuevoPassword; // pre-save hook hashea
    // Nunca actualizar role desde este endpoint

    await usuario.save();
    res.json({ exito: true, datos: respuestaUsuario(usuario) });
  } catch (error) {
    next(error);
  }
};
