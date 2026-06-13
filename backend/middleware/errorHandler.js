/**
 * Middleware para rutas no encontradas (404). Se monta tras todos los routers;
 * cualquier petición que no haya sido manejada llega aquí.
 *
 * Rol arquitectónico: Middleware de Express (catch-all 404).
 *
 * @function notFound
 * @param {import("express").Request} req  Lee `req.originalUrl` {string} para el mensaje.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void} Fija `res.status(404)` y delega al `errorHandler` vía `next(error)`.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Manejador de errores centralizado de Express. Se reconoce como tal por tener
 * 4 parámetros. Debe ser el último middleware registrado.
 *
 * Si el status sigue en 200 (no se fijó uno explícito antes del error), se
 * asume un fallo no anticipado y se responde 500. El stack trace sólo se incluye
 * fuera de producción.
 *
 * Rol arquitectónico: Middleware de error de Express.
 *
 * @function errorHandler
 * @param {Error} err   Error propagado (su `.message` y `.stack` se exponen).
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next  (No usado; requerido por la firma de 4 args.)
 * @returns {void} Envía JSON `{ exito:false, mensaje:string, stack:(string|null) }`
 *   con el código de estado resuelto (`res.statusCode` o 500).
 */
export const errorHandler = (err, req, res, next) => {
  // Si el status es 200 (default), cambiarlo a 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    exito: false,
    mensaje: err.message,
    // Solo mostrar el stack trace en desarrollo
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
