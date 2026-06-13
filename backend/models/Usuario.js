import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

// Hash de contraseña antes de guardar
// En Mongoose 9, los hooks async NO reciben el parámetro next — la promesa que resuelve es la señal de fin
usuarioSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Método de instancia para comparar contraseña en login
usuarioSchema.methods.compararPassword = async function (candidata) {
  return bcrypt.compare(candidata, this.password);
};

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
