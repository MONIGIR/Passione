import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./config/db.js";
import productoRoutes from "./routes/productoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOrigin =
  process.env.NODE_ENV === "development"
    ? (origin, cb) => cb(null, true) // En dev acepta cualquier origen (incluyendo cualquier puerto de Vite)
    : process.env.CLIENT_URL;        // En producción, solo el dominio configurado

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({
    mensaje: "API Passione E-Commerce",
    version: "2.0.0",
    endpoints: {
      auth: "/api/auth",
      productos: "/api/productos",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});
