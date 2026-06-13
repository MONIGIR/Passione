import { useState, useEffect } from 'react';
import {
  obtenerUsuariosApi,
  crearUsuarioApi,
  actualizarUsuarioApi,
  eliminarUsuarioApi,
} from '../services/usuarioService';
import '../styles/AdminUser.css';

const FORM_INICIAL = { nombre: '', email: '', password: '', role: 'usuario' };

const GestionUsuarios = () => {
  const [usuarios, setUsuarios]       = useState([]);
  const [formData, setFormData]       = useState(FORM_INICIAL);
  const [editandoId, setEditandoId]   = useState(null); // null = modo crear
  const [cargando, setCargando]       = useState(true);
  const [guardando, setGuardando]     = useState(false);
  const [error, setError]             = useState('');
  const [exito, setExito]             = useState('');

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const datos = await obtenerUsuariosApi();
      setUsuarios(datos);
    } catch {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(''), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      if (editandoId) {
        const payload = { nombre: formData.nombre, email: formData.email, role: formData.role };
        if (formData.password) payload.password = formData.password;
        const actualizado = await actualizarUsuarioApi(editandoId, payload);
        setUsuarios(usuarios.map(u => u._id === editandoId ? { ...u, ...actualizado } : u));
        mostrarExito('Usuario actualizado correctamente.');
      } else {
        const nuevo = await crearUsuarioApi(formData);
        setUsuarios([nuevo, ...usuarios]);
        mostrarExito('Usuario creado correctamente.');
      }
      cancelarEdicion();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el usuario.');
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicion = (usuario) => {
    setEditandoId(usuario._id);
    setFormData({ nombre: usuario.nombre, email: usuario.email, password: '', role: usuario.role });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData(FORM_INICIAL);
    setError('');
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarUsuarioApi(id);
      setUsuarios(usuarios.filter(u => u._id !== id));
      mostrarExito('Usuario eliminado.');
      if (editandoId === id) cancelarEdicion();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al eliminar.');
    }
  };

  const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="dashboard-main-content">
      <header className="dashboard-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>{usuarios.length} usuario(s) registrado(s) en el sistema.</p>
        </div>
      </header>

      <div className="gestion-usuarios-container">
        {/* ── FORMULARIO ─────────────────────────────── */}
        <div className="formulario-seccion">
          <div className={`card-formulario ${editandoId ? 'modo-edicion' : ''}`}>
            <h2 className="titulo-formulario">
              {editandoId ? '✏️ Editar Usuario' : '➕ Agregar Usuario'}
            </h2>

            {error  && <div className="alert alert-error">{error}</div>}
            {exito  && <div className="alert alert-exito">{exito}</div>}

            <form onSubmit={handleSubmit} className="form-content">
              <div className="form-group">
                <label>Nombre completo</label>
                <input name="nombre" type="text" value={formData.nombre}
                  onChange={handleChange} placeholder="Nombre" required />
              </div>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input name="email" type="email" value={formData.email}
                  onChange={handleChange} placeholder="correo@ejemplo.com" required />
              </div>
              <div className="form-group">
                <label>{editandoId ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
                <input name="password" type="password" value={formData.password}
                  onChange={handleChange} placeholder="Mínimo 8 caracteres"
                  required={!editandoId} />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select name="role" value={formData.role} onChange={handleChange} className="form-select">
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="contenedor-boton">
                <button type="submit" className={`btn-add-user ${editandoId ? 'btn-update' : ''}`}
                  disabled={guardando}>
                  {guardando ? 'Guardando...' : editandoId ? 'Actualizar' : 'Crear Usuario'}
                </button>
                {editandoId && (
                  <button type="button" className="btn-cancelar" onClick={cancelarEdicion}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── TABLA ──────────────────────────────────── */}
        <div className="tabla-seccion">
          <div className="card-tabla">
            <div className="tabla-header-row">
              <span className="tabla-titulo">Usuarios del sistema</span>
              <button className="btn-refresh" onClick={cargarUsuarios} title="Recargar">↺</button>
            </div>
            <div className="tabla-scroll">
              <table className="tabla-usuarios">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    Array(4).fill(null).map((_, i) => (
                      <tr key={i} className="skeleton-row">
                        {Array(6).fill(null).map((__, j) => <td key={j}><div className="skeleton-cell" /></td>)}
                      </tr>
                    ))
                  ) : usuarios.length === 0 ? (
                    <tr><td colSpan="6" className="td-vacio">No hay usuarios registrados.</td></tr>
                  ) : (
                    usuarios.map((user, idx) => (
                      <tr key={user._id}
                        className={`fila-usuario ${editandoId === user._id ? 'fila-activa' : ''}`}
                        style={{ animationDelay: `${idx * 0.04}s` }}>
                        <td className="td-num">{idx + 1}</td>
                        <td className="td-nombre">{user.nombre}</td>
                        <td className="td-email">{user.email}</td>
                        <td>
                          <span className={`badge-rol ${user.role}`}>{user.role}</span>
                        </td>
                        <td className="td-fecha">{user.createdAt ? formatFecha(user.createdAt) : '—'}</td>
                        <td className="td-acciones">
                          <button className="btn-action edit" title="Editar"
                            onClick={() => iniciarEdicion(user)}>✏️</button>
                          <button className="btn-action delete" title="Eliminar"
                            onClick={() => handleEliminar(user._id, user.nombre)}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;
