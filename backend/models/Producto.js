import mongoose from "mongoose";

/**
 * @typedef {Object} ProductoDoc
 * @property {string}  nombre       Nombre visible. Requerido, máx. 100, trim.
 * @property {string}  descripcion  Descripción. Máx. 500, trim. (Ver nota: campo duplicado.)
 * @property {string}  sku          Stock Keeping Unit. Requerido, único, uppercase, trim.
 * @property {string}  categoria    Enum de 6 categorías. Default `"Otros"`.
 * @property {number}  precio       Precio base. Requerido, min 0.
 * @property {number}  costo        Costo interno. Default 0, min 0.
 * @property {number}  stock        Unidades disponibles. Requerido, min 0, default 0.
 * @property {number}  stockMinimo  Umbral de alerta de stock. Default 5, min 0.
 * @property {string}  ubicacion    Ubicación física en almacén. Default "".
 * @property {string}  proveedor    Nombre del proveedor. Default "".
 * @property {boolean} activo       Soft-delete / visibilidad. Default true.
 * @property {string}  imageUrl     URL de imagen. Default "".
 * @property {boolean} enOferta     Activa el descuento. Default false.
 * @property {number}  descuento    Porcentaje 0–100. Default 0.
 */

/**
 * Esquema Mongoose del modelo Producto.
 *
 * Rol arquitectónico: Modelo de dominio del catálogo/inventario.
 *
 * [REQUIERE CLARIFICACIÓN DE LÓGICA] El campo `descripcion` está declarado DOS
 * veces en este esquema. En un objeto literal JS la segunda clave sobreescribe
 * a la primera, por lo que la definición efectiva es la del final del objeto.
 * No produce error en runtime, pero es ambiguo: debe eliminarse una de las dos.
 */
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
    // NOTA: segunda declaración de `descripcion` — sobreescribe a la de arriba.
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
// Mejoran el rendimiento de las consultas frecuentes.
// NOTA: el índice de texto no se aprovecha porque el controlador busca con $regex.
productoSchema.index({ nombre: "text", descripcion: "text" }); // Búsqueda de texto
productoSchema.index({ categoria: 1 });
productoSchema.index({ activo: 1 });

// ──── VIRTUALS ─────────────────────────────

/**
 * Virtual `stockBajo`: indica si el producto está en o por debajo del mínimo.
 * @this {ProductoDoc}
 * @returns {boolean} `true` si `stock <= stockMinimo`.
 */
productoSchema.virtual("stockBajo").get(function () {
  return this.stock <= this.stockMinimo;
});

/**
 * Virtual `valorTotal`: valor monetario del inventario de este producto.
 * @this {ProductoDoc}
 * @returns {number} `precio * stock`.
 */
productoSchema.virtual("valorTotal").get(function () {
  return this.precio * this.stock;
});

/**
 * Virtual `precioFinal`: precio tras aplicar descuento si está en oferta.
 * @this {ProductoDoc}
 * @returns {number} Precio con descuento (2 decimales) o `precio` si no hay oferta.
 */
productoSchema.virtual("precioFinal").get(function () {
  if (!this.enOferta || !this.descuento) return this.precio;
  return parseFloat((this.precio * (1 - this.descuento / 100)).toFixed(2));
});

// Incluir virtuals al serializar a JSON / objeto plano.
productoSchema.set("toJSON", { virtuals: true });
productoSchema.set("toObject", { virtuals: true });

const Producto = mongoose.model("Producto", productoSchema);
export default Producto;
