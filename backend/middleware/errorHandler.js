// Middleware para rutas no encontradas
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware general de errores
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