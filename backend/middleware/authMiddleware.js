import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

/**
 * Middleware de autenticación. Verifica el JWT presente en la cookie `token`,
 * hidrata el usuario desde MongoDB y lo adjunta a `req.usuario`.
 *
 * Rol arquitectónico: Middleware de Express (guardián de rutas privadas).
 * Debe ejecutarse antes que cualquier handler que dependa de `req.usuario`.
 *
 * @async
 * @function protect
 * @param {import("express").Request} req  Petición. Lee `req.cookies.token` {string}.
 * @param {import("express").Response} res Respuesta (usada para fijar el status code de error).
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} En éxito invoca `next()` con `req.usuario` poblado
 *   (documento Usuario sin `password`).
 * @throws {Error} Vía `next(error)` con `res.status(401)` cuando:
 *   - el token está ausente,
 *   - el token es inválido/expirado (capturado del `jwt.verify`),
 *   - el usuario no existe o está inactivo.
 */
export const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401);
    return next(new Error("No autorizado: token ausente"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adjunta el usuario al request (sin el campo password)
    req.usuario = await Usuario.findById(decoded.id).select("-password");

    if (!req.usuario || !req.usuario.activo) {
      res.status(401);
      return next(new Error("No autorizado: usuario inválido o inactivo"));
    }

    next();
  } catch {
    res.status(401);
    next(new Error("No autorizado: token inválido o expirado"));
  }
};

/**
 * Middleware de autorización por rol. Restringe el acceso a administradores.
 * Debe encadenarse SIEMPRE después de `protect` (depende de `req.usuario`).
 *
 * Es síncrono: sólo lee una propiedad ya en memoria, no hace I/O.
 *
 * @function soloAdmin
 * @param {import("express").Request} req  Lee `req.usuario.role` {("usuario"|"admin")}.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void} Invoca `next()` si el rol es `"admin"`.
 * @throws {Error} Vía `next(error)` con `res.status(403)` si el rol no es admin.
 */
export const soloAdmin = (req, res, next) => {
  if (req.usuario?.role !== "admin") {
    res.status(403);
    return next(new Error("Prohibido: se requiere rol de administrador"));
  }
  next();
};
