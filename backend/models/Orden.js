import mongoose from "mongoose";

/**
 * @typedef {Object} ItemOrden
 * @property {mongoose.Types.ObjectId} producto Referencia al Producto original.
 * @property {string}  nombre      Snapshot del nombre al momento de la compra. Requerido.
 * @property {string}  sku         Snapshot del SKU.
 * @property {string}  imageUrl    Snapshot de la URL de imagen. Default "".
 * @property {number}  precio      Snapshot del precio base. Requerido.
 * @property {number}  precioFinal Snapshot del precio con descuento. Requerido.
 * @property {number}  cantidad    Unidades compradas. Requerido, min 1.
 * @property {number}  subtotal    `precioFinal * cantidad`. Requerido.
 */

/**
 * Sub-esquema de un ítem de la orden. `{_id:false}` desactiva el ObjectId
 * automático de los subdocumentos (no se identifican individualmente).
 *
 * Los campos son SNAPSHOTS desnormalizados: preservan los datos del producto
 * tal como estaban al comprar, de modo que el historial sea inmutable aunque
 * el producto cambie o se elimine después.
 */
const itemOrdenSchema = new mongoose.Schema({
  producto:   { type: mongoose.Schema.Types.ObjectId, ref: "Producto" },
  nombre:     { type: String, required: true },
  sku:        { type: String },
  imageUrl:   { type: String, default: "" },
  precio:     { type: Number, required: true }, // precio original
  precioFinal:{ type: Number, required: true }, // precio tras descuento
  cantidad:   { type: Number, required: true, min: 1 },
  subtotal:   { type: Number, required: true },
}, { _id: false });

/**
 * @typedef {Object} OrdenDoc
 * @property {mongoose.Types.ObjectId} usuario Referencia al Usuario comprador. Requerido.
 * @property {string} nombreCliente  Snapshot del nombre del cliente. Requerido.
 * @property {string} emailCliente   Snapshot del email del cliente. Requerido.
 * @property {ItemOrden[]} items     Líneas de la orden. Requerido.
 * @property {number} total          Suma de subtotales. Requerido.
 * @property {"pendiente"|"procesando"|"enviado"|"completado"|"cancelado"} estado
 *           Estado del ciclo de vida. Default `"pendiente"`.
 * @property {Date} createdAt        Auto (`timestamps`).
 * @property {Date} updatedAt        Auto (`timestamps`).
 */

/**
 * Esquema Mongoose del modelo Orden.
 *
 * Rol arquitectónico: Modelo de dominio del proceso de compra. Almacena datos
 * del cliente denormalizados para que la orden sobreviva a la eliminación del
 * usuario o de los productos.
 */
const ordenSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    // Datos del cliente denormalizados: quedan aunque el usuario se elimine
    nombreCliente: { type: String, required: true },
    emailCliente:  { type: String, required: true },
    items:  { type: [itemOrdenSchema], required: true },
    total:  { type: Number, required: true },
    estado: {
      type: String,
      enum: ["pendiente", "procesando", "enviado", "completado", "cancelado"],
      default: "pendiente",
    },
  },
  { timestamps: true }
);

const Orden = mongoose.model("Orden", ordenSchema);
export default Orden;
