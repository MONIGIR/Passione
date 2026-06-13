import mongoose from "mongoose";
import dns from "dns";

/**
 * Fuerza el resolver DNS del proceso Node.js a usar los servidores públicos de
 * Google (8.8.8.8 / 8.8.4.4) en lugar del resolver del sistema operativo.
 *
 * Es un workaround para entornos donde el DNS local no resuelve los registros
 * SRV de MongoDB Atlas (`*.mongodb.net`). Efecto secundario: TODAS las
 * resoluciones DNS del proceso usarán Google DNS, no solo las de Atlas.
 */
dns.setServers(["8.8.8.8", "8.8.4.4"]);

/**
 * Establece la conexión única con el cluster de MongoDB usando Mongoose.
 *
 * Lee la cadena de conexión desde `process.env.MONGODB_URI`, por lo que debe
 * invocarse DESPUÉS de `dotenv.config()`. Mongoose 9 ya no requiere las
 * opciones `useNewUrlParser` / `useUnifiedTopology`.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} No retorna valor; en éxito imprime el host conectado.
 * @throws {Error} Cualquier fallo de conexión (red, credenciales, DNS) se captura
 *   internamente: se loguea el mensaje y se ejecuta `process.exit(1)`, terminando
 *   el proceso. El error NO se propaga al llamador.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
