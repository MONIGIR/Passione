import { useState, useEffect } from 'react';
import '../styles/AdminUser.css';
// ICONS
const GestionUsuarios = ({ setVistaActual, onLogout }) => {
const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    password: '',
    userAddress: '',
    role: '',
});

const [usuarios, setUsuarios] = useState([]);

useEffect(() => {
    const datosSimulados = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@test.com', rol: 'Admin' },
    { id: 2, nombre: 'María López', email: 'maria@test.com', rol: 'User' },
    { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@test.com', rol: 'User' },
    ];
    setUsuarios(datosSimulados);
}, []);

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};

const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.userName || !formData.userEmail || !formData.password) {
    alert('Por favor, completa los campos obligatorios (Name, Email, Password).');
    return;
    }

    const nuevoUsuario = {
    id: usuarios.length + 1,
    nombre: formData.userName,
    email: formData.userEmail,
    rol: formData.role || 'User',
    };

    setUsuarios([...usuarios, nuevoUsuario]);
    setFormData({ userName: '', userEmail: '', password: '', userAddress: '', role: '' });
};

const handleBorrar = (id) => {
    if (window.confirm(`¿Estás seguro de borrar al usuario con ID ${id}?`)) {
    setUsuarios(usuarios.filter((u) => u.id !== id));
    }
};

return (
    <div className="dashboard-main-content">
        <div className="gestion-usuarios-container">
        <div className="formulario-seccion">
            <div className="card-formulario">
            <h2 className="titulo-formulario">Agregar Usuario</h2>
            <form onSubmit={handleSubmit} className="form-content">
                <div className="form-group">
                <label>Nombre</label>
                <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Ingresa nombre"
                />
                </div>
                <div className="form-group">
                <label>Correo electronico</label>
                <input
                    type="email"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                />
                </div>
                <div className="form-group">
                <label>Contraseña</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                />
                </div>
                <div className="form-group">
                <label>Direccion del usuario</label>
                <input
                    type="text"
                    name="userAddress"
                    value={formData.userAddress}
                    onChange={handleChange}
                    placeholder="Calle 123, Ciudad"
                />
                </div>
                <div className="form-group">
                <label>Asignar Usuario</label>
                <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Ej. Admin, User"
                />
                </div>
                <div className="contenedor-boton">
                <button type="submit" className="btn-add-user">
                    Add User
                </button>
                </div>
            </form>
            </div>
        </div>
        <div className="tabla-seccion">
            <div className="card-tabla">
            <table className="tabla-usuarios">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {usuarios.length === 0 ? (
                    <tr>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    </tr>
                ) : (
                    usuarios.map((user) => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.nombre}</td>
                        <td>{user.email}</td>
                        <td>
                        <span className={`badge-rol ${user.rol.toLowerCase()}`}>
                            {user.rol}
                        </span>
                        </td>
                        <td>
                        <button
                            className="btn-action delete"
                            onClick={() => handleBorrar(user.id)}
                            title="Borrar Usuario"
                        >
                            🗑️
                        </button>
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
);
};

export default GestionUsuarios;
