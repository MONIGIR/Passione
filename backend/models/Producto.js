import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    sku: {
      type: String,
      required: [true, "El SKU es obligatorio"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: {
        values: ["Electrónica", "Ropa", "Hogar", "Deportes", "Alimentos", "Otros"],
        message: "La categoría '{VALUE}' no es válida",
      },
      default: "Otros",
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    costo: {
      type: Number,
      default: 0,
      min: [0, "El costo no puede ser negativo"],
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },
    stockMinimo: {
      type: Number,
      default: 5,
      min: [0, "El stock mínimo no puede ser negativo"],
    },
    ubicacion: {
      type: String,
      trim: true,
      default: "",
    },
    proveedor: {
      type: String,
      trim: true,
      default: "",
    },
    activo: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    enOferta: {
      type: Boolean,
      default: false,
    },
    descuento: {
      type: Number,
      default: 0,
      min: [0, "El descuento no puede ser negativo"],
      max: [100, "El descuento no puede superar 100%"],
    },
    descripcion: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
  },
  { timestamps: true }
);

// ──── ÍNDICES ──────────────────────────────
// Mejoran el rendimiento de las consultas frecuentes
productoSchema.index({ nombre: "text", descripcion: "text" }); // Búsqueda de texto
productoSchema.index({ categoria: 1 });
productoSchema.index({ activo: 1 });

// ──── VIRTUALS ─────────────────────────────
// Campo calculado: ¿tiene stock bajo?
productoSchema.virtual("stockBajo").get(function () {
  return this.stock <= this.stockMinimo;
});

// Campo calculado: valor total en inventario
productoSchema.virtual("valorTotal").get(function () {
  return this.precio * this.stock;
});

// Precio final aplicando descuento
productoSchema.virtual("precioFinal").get(function () {
  if (!this.enOferta || !this.descuento) return this.precio;
  return parseFloat((this.precio * (1 - this.descuento / 100)).toFixed(2));
});

// Incluir virtuals en JSON y Object
productoSchema.set("toJSON", { virtuals: true });
productoSchema.set("toObject", { virtuals: true });

const Producto = mongoose.model("Producto", productoSchema);
export default Producto;