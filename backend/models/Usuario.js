import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * @typedef {Object} UsuarioDoc
 * @property {string} nombre       Nombre del usuario. Requerido, máx. 80 chars, trim.
 * @property {string} email        Email único, normalizado a minúsculas. Validado por regex.
 * @property {string} password     Hash bcrypt. `select:false` → excluido de queries por defecto.
 * @property {"usuario"|"admin"} role  Rol de autorización. Default `"usuario"`.
 * @property {boolean} activo      Flag de soft-delete / suspensión. Default `true`.
 * @property {Date} createdAt      Generado automáticamente (`timestamps`).
 * @property {Date} updatedAt      Actualizado automáticamente en cada `save()`.
 */

/**
 * Esquema Mongoose del modelo Usuario.
 *
 * Rol arquitectónico: Modelo de dominio (capa de datos). Define estructura,
 * validaciones y lógica de instancia para autenticación.
 *
 * Notas de seguridad relevantes del esquema:
 * - `password` usa `select:false`: nunca se devuelve salvo `.select("+password")`.
 * - `email` con `unique:true` genera un índice único en MongoDB.
 */
const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [80, "El nombre no puede exceder 80 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "El formato de email no es válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
      select: false, // Nunca se devuelve en queries por defecto
    },
    role: {
      type: String,
      enum: ["usuario", "admin"],
      default: "usuario",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Hook pre-save: hashea la contraseña con bcrypt (cost factor 12) antes de
 * persistir, sólo si el campo `password` fue modificado.
 *
 * En Mongoose 9 los hooks async NO reciben `next`: la resolución de la promesa
 * es la señal de finalización. La guarda `isModified` evita re-hashear un hash
 * ya existente al actualizar otros campos.
 *
 * @this {UsuarioDoc} Documento Mongoose en proceso de guardado.
 * @returns {Promise<void>}
 */
usuarioSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/**
 * Método de instancia: compara una contraseña en texto plano contra el hash
 * almacenado. Requiere que `password` haya sido cargado con `.select("+password")`.
 *
 * @async
 * @memberof UsuarioDoc
 * @param {string} candidata Contraseña en texto plano a verificar.
 * @returns {Promise<boolean>} `true` si coincide con el hash; `false` en caso contrario.
 */
usuarioSchema.methods.compararPassword = async function (candidata) {
  return bcrypt.compare(candidata, this.password);
};

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
