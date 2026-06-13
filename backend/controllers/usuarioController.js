import Usuario from "../models/Usuario.js";
import Producto from "../models/Producto.js";

/**
 * Lista todos los usuarios (sin contraseña), ordenados por creación descendente.
 *
 * @route   GET /api/usuarios
 * @access  Privado · Admin (router aplica `protect, soloAdmin`)
 * @async
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, conteo:number, datos:UsuarioDoc[] }`.
 * @throws {Error} Errores de DB → `next(error)` (500).
 *
 * [RENDIMIENTO] Sin paginación: carga toda la colección de usuarios en memoria.
 */
export const obtenerUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 }).select("-password");
    res.json({ exito: true, conteo: usuarios.length, datos: usuarios });
  } catch (error) {
    next(error);
  }
};

/**
 * Crea un usuario con rol asignable (uso administrativo).
 *
 * @route   POST /api/usuarios
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.body
 * @param {string} req.body.nombre   Nombre. Obligatorio.
 * @param {string} req.body.email    Email. Obligatorio.
 * @param {string} req.body.password Contraseña. Obligatoria (el modelo exige mín. 8).
 * @param {"usuario"|"admin"} [req.body.role] Rol; default `"usuario"`.
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 201 + `{ exito:true, datos:{_id,nombre,email,role} }`.
 * @throws {Error} 400 si faltan campos obligatorios o el email ya existe. DB → 500.
 *
 * [REQUIERE CLARIFICACIÓN DE LÓGICA] No usa express-validator: `email` y `role`
 * llegan sin sanitizar/validar. Un `email` con forma de objeto podría usarse en
 * el `findOne` para inyección NoSQL; `role` no se restringe al enum aquí (sí en
 * el modelo). Conviene validar formato de email y whitelizar `role`.
 */
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

/**
 * Actualiza un usuario por id. Usa `save()` (no `findByIdAndUpdate`) para que el
 * pre-save hook re-hashee la contraseña cuando se modifica.
 *
 * @route   PUT /api/usuarios/:id
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.params
 * @param {string} req.params.id  ObjectId del usuario a actualizar.
 * @param {Object} req.body
 * @param {string} [req.body.nombre]   Nuevo nombre.
 * @param {string} [req.body.email]    Nuevo email.
 * @param {"usuario"|"admin"} [req.body.role] Nuevo rol.
 * @param {string} [req.body.password] Nueva contraseña (sólo se aplica si tiene ≥ 8 chars).
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, datos:{_id,nombre,email,role} }`.
 * @throws {Error} 404 si el usuario no existe. DB → 500.
 *
 * [REQUIERE CLARIFICACIÓN DE LÓGICA] Si `password` tiene < 8 chars se ignora
 * silenciosamente (sin error). El admin podría creer que la cambió.
 */
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

/**
 * Elimina un usuario por id. Impide que el admin elimine su propia cuenta.
 *
 * @route   DELETE /api/usuarios/:id
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {Object} req.params
 * @param {string} req.params.id  ObjectId del usuario a eliminar.
 * @param {import("express").Response} res  Lee `req.usuario._id` (sesión actual).
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, mensaje:string }`.
 * @throws {Error} 400 si se intenta auto-eliminar; 404 si el usuario no existe. DB → 500.
 *
 * [REQUIERE CLARIFICACIÓN DE LÓGICA] No previene eliminar al último admin: el
 * sistema podría quedar sin administradores.
 */
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

/**
 * Métricas agregadas para el dashboard administrativo. Ejecuta los 4 conteos
 * en paralelo con `Promise.all`.
 *
 * @route   GET /api/usuarios/stats
 * @access  Privado · Admin
 * @async
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>} 200 + `{ exito:true, datos:{ totalUsuarios:number,
 *   totalAdmins:number, totalProductos:number, stockBajo:number } }`.
 * @throws {Error} Errores de DB → 500.
 */
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
