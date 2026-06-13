import mongoose from "mongoose";

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
