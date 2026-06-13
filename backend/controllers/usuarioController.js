import Usuario from "../models/Usuario.js";
import Producto from "../models/Producto.js";

// GET /api/usuarios
export const obtenerUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 }).select("-password");
    res.json({ exito: true, conteo: usuarios.length, datos: usuarios });
  } catch (error) {
    next(error);
  }
};

// POST /api/usuarios (admin crea usuario con rol asignable)
export const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, role } = req.body;
    if (!nombre || !email || !password) {
      res.status(400);
      return next(new Error("Nombre, email y contraseña son obligatorios"));
    }
    const existe = await Usuario.findOne({ email });
    if (existe) {
      res.status(400);
      return next(new Error("El email ya está registrado"));
    }
    const usuario = await Usuario.create({ nombre, email, password, role: role || "usuario" });
    res.status(201).json({
      exito: true,
      datos: { _id: usuario._id, nombre: usuario.nombre, email: usuario.email, role: usuario.role },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/usuarios/:id
export const actualizarUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      res.status(404);
      return next(new Error("Usuario no encontrado"));
    }
    const { nombre, email, role, password } = req.body;
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (role) usuario.role = role;
    if (password && password.length >= 8) usuario.password = password; // pre-save hook hashea

    await usuario.save();
    res.json({
      exito: true,
      datos: { _id: usuario._id, nombre: usuario.nombre, email: usuario.email, role: usuario.role },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/usuarios/:id
export const eliminarUsuario = async (req, res, next) => {
  try {
    if (req.params.id === req.usuario._id.toString()) {
      res.status(400);
      return next(new Error("No puedes eliminar tu propia cuenta"));
    }
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      res.status(404);
      return next(new Error("Usuario no encontrado"));
    }
    res.json({ exito: true, mensaje: `Usuario "${usuario.nombre}" eliminado` });
  } catch (error) {
    next(error);
  }
};

// GET /api/usuarios/stats — métricas para el dashboard
export const obtenerStats = async (req, res, next) => {
  try {
    const [totalUsuarios, totalAdmins, totalProductos, stockBajo] = await Promise.all([
      Usuario.countDocuments(),
      Usuario.countDocuments({ role: "admin" }),
      Producto.countDocuments({ activo: true }),
      Producto.countDocuments({ activo: true, $expr: { $lte: ["$stock", "$stockMinimo"] } }),
    ]);
    res.json({ exito: true, datos: { totalUsuarios, totalAdmins, totalProductos, stockBajo } });
  } catch (error) {
    next(error);
  }
};
