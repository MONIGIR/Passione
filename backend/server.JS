import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import productoRoutes from "./routes/productoRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// ──── Cargar variables de entorno ─────────────
dotenv.config();

// ──── Conectar a MongoDB ──────────────────────
connectDB();

// ──── Crear aplicación Express ────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ──── Middlewares globales ────────────────────
app.use(cors());                    // Permitir peticiones del frontend
app.use(express.json());            // Parsear JSON en el body
app.use(express.urlencoded({ extended: true })); // Parsear form data
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));           // Log de peticiones solo en desarrollo
}

// ──── Ruta de bienvenida ──────────────────────
app.get("/", (req, res) => {
  res.json({
    mensaje: "🚀 API de Inventario MERN",
    version: "1.0.0",
    endpoints: {
      productos: "/api/productos",
      stockBajo: "/api/productos/reportes/stock-bajo",
      resumen: "/api/productos/reportes/resumen",
    },
  });
});

// ──── Rutas de la API ─────────────────────────
app.use("/api/productos", productoRoutes);

// ──── Manejo de errores (siempre al final) ────
app.use(notFound);
app.use(errorHandler);

// ──── Iniciar servidor ────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║  🖥️  Servidor corriendo en puerto ${PORT}     ║
  ║  📍 http://localhost:${PORT}              ║
  ║  🌍 Entorno: ${process.env.NODE_ENV}            ║
  ╚══════════════════════════════════════════╝
  `);
});