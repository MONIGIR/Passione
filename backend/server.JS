/**
 * @file Punto de entrada del backend de Passione E-Commerce.
 *
 * Rol arquitectónico: Bootstrap de la aplicación Express. Carga variables de
 * entorno, conecta a MongoDB, registra middleware globales, monta los
 * enrutadores de la API y arranca el servidor HTTP.
 *
 * Dependencias clave: express, dotenv, cors, cookie-parser, morgan, mongoose
 * (vía ./config/db.js) y los enrutadores/middleware locales.
 *
 * [BUG CRÍTICO — REQUIERE CLARIFICACIÓN] Este archivo se llama `server.JS`
 * (extensión en mayúsculas) pero `package.json` ejecuta `node server.js`. En
 * sistemas de archivos case-sensitive (Linux, contenedores) `npm start` /
 * `npm run dev` fallarán con "Cannot find module server.js". Renombrar a
 * `server.js` (minúsculas) para garantizar el arranque en cualquier plataforma.
 */
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./config/db.js";
import productoRoutes from "./routes/productoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import ordenRoutes   from "./routes/ordenRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Política de CORS bifurcada por entorno.
 * - development: callback que acepta cualquier origen (útil con puertos variables de Vite).
 * - producción : restringe al dominio exacto de `CLIENT_URL`.
 * @type {((origin:string, cb:Function)=>void)|string}
 */
const corsOrigin =
  process.env.NODE_ENV === "development"
    ? (origin, cb) => cb(null, true) // En dev acepta cualquier origen (incluyendo cualquier puerto de Vite)
    : process.env.CLIENT_URL;        // En producción, solo el dominio configurado

// `credentials:true` es necesario para que el navegador envíe la cookie de sesión cross-origin.
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());                          // Parseo de cuerpos JSON → req.body
app.use(express.urlencoded({ extended: true }));  // Parseo de formularios urlencoded
app.use(cookieParser());                          // Expone cookies en req.cookies (requerido por protect)

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));                          // Log de peticiones sólo en desarrollo
}

/**
 * @route GET / · @access Público
 * @desc  Health-check / metadatos de la API.
 * @returns {Object} `{ mensaje, version, endpoints }`.
 */
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

// Montaje de enrutadores de la API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/ordenes",  ordenRoutes);
app.use("/api/productos", productoRoutes);

// Manejadores de error: DEBEN ir al final de la cadena de middleware.
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});
