import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

// Verifica que el request lleve un JWT válido en la cookie
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

// Solo permite el acceso a admins (usar después de protect)
export const soloAdmin = (req, res, next) => {
  if (req.usuario?.role !== "admin") {
    res.status(403);
    return next(new Error("Prohibido: se requiere rol de administrador"));
  }
  next();
};
