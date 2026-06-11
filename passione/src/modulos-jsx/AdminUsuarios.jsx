import { useState, useEffect } from 'react';
import '../styles/AdminUser.css';
import BarraLateral from './barraLateral';

//ICONS
import IconInventario from '../assets/book-open-text.svg';
import IconOrdenes from '../assets/package.svg';
import IconInicio from '../assets/house.svg';
import IconCerrarSesion from '../assets/power.svg';
import IconUsuario from '../assets/user.svg';


const GestionUsuarios = () => {

    const Botones = [
    { imagen: IconInicio, texto: "Inicio", enlace: '' },
    { imagen: IconUsuario, texto: "Usuarios", enlace: '' },
    { imagen: IconInventario, texto: "Inventario", enlace: '#' },
    { imagen: IconOrdenes, texto: "Ordenes", enlace: '#' },
    { imagen: IconCerrarSesion, texto: "Cerrar sesion", enlace: '' },
];

  // Estado para el formulario con los nuevos campos de la imagen
const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    password: '',
    userAddress: '',
    role: '' // Campo de texto simple según la imagen
});

  // Estado para la lista de usuarios (Postgres)
const [usuarios, setUsuarios] = useState([]);

  // --- INTEGRACIÓN CON POSTGRES (Node.js API) ---

  // 1. Cargar usuarios al montar el componente (GET)
useEffect(() => {
    // Aquí harías tu fetch real:
    // fetch('http://tu-api.com/api/usuarios')
    //   .then(res => res.json())
    //   .then(data => setUsuarios(data));

    // Datos simulados basados en la estructura de la tabla
    const datosSimulados = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@test.com', rol: 'Admin' },
    { id: 2, nombre: 'María López', email: 'maria@test.com', rol: 'User' },
    {id: 3, nombre: 'Carlos Ruiz', email: 'carlos@test.com', rol: 'User' },
    ];
    setUsuarios(datosSimulados);
}, []);

  // Manejar cambios en los inputs
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};

  // 2. Enviar nuevo usuario (POST)
const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.userName || !formData.userEmail || !formData.password) {
    alert('Por favor, completa los campos obligatorios (Name, Email, Password).');
    return;
    }

    // Objeto para enviar a Postgres
    const nuevoUsuarioParaPostgres = {
    nombre: formData.userName,
    email: formData.userEmail,
      password: formData.password, // Asegúrate de encriptar esto en el backend
    direccion: formData.userAddress,
    rol: formData.role
    };

    console.log('Enviando a Postgres:', nuevoUsuarioParaPostgres);

    // --- Ejemplo de fetch POST real ---
    /*
    fetch('http://tu-api.com/api/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoUsuarioParaPostgres)
    })
    .then(res => res.json())
    .then(usuarioCreado => {
      // Actualizar la tabla con el usuario creado por Postgres (que ya trae ID real)
    setUsuarios([...usuarios, usuarioCreado]);
      // Limpiar formulario
    setFormData({ userName: '', userEmail: '', password: '', userAddress: '', role: '' });
    })
    .catch(error => console.error('Error:', error));
    */

    // Simulación de actualización local instantánea
    const usuarioSimuladoPostgres = {
        id: usuarios.length + 1, // ID temporal
        nombre: formData.userName,
        email: formData.userEmail,
        rol: formData.role || 'User'
    };
    setUsuarios([...usuarios, usuarioSimuladoPostgres]);
    setFormData({ userName: '', userEmail: '', password: '', userAddress: '', role: '' });
};

  // 3. Función para borrar usuario (DELETE)
const handleBorrar = (id) => {
    if(window.confirm(`¿Estás seguro de borrar al usuario con ID ${id}?`)) {
        console.log(`Borrando usuario ${id} en Postgres...`);
        // fetch(`http://tu-api.com/api/usuarios/${id}`, { method: 'DELETE' })
        // .then(() => {
             // Actualizar tabla localmente
            setUsuarios(usuarios.filter(u => u.id !== id));
        // });
    }
};

return (
<div className="layout-general">
<BarraLateral botones={Botones}/>
    <div className="gestion-usuarios-container">
      {/* Sección Izquierda: Formulario */}
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
            <label>asignar Usuario</label>
            <input 
                type="text" 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                placeholder="Ej. Admin, User"
            />
            </div>

            <div className="contenedor-boton">
            <button type="submit" className="btn-add-user">Add User</button>
            </div>
        </form>
        </div>
    </div>

      {/* Sección Derecha: Tabla de Usuarios */}
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
                // Fila por defecto si no hay datos (como en tu imagen)
                <tr>
                <td>--</td>
                <td>--</td>
                <td>--</td>
                <td>--</td>
                <td>--</td>
                </tr>
            ) : (
                // Renderizado dinámico de datos de Postgres
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