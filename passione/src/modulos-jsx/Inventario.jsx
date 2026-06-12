import { useState, useEffect } from 'react';
import BarraLateral from '../modulos-jsx/barraLateral';
import '../styles/inventario.css';

// Tus iconos de la barra lateral...
import IconUsuario from '../assets/user.svg';
import IconInicio from '../assets/house.svg';
import IconInventario from '../assets/book-open-text.svg';
import IconConfig from '../assets/wrench.svg';
import IconOrdenes from '../assets/book-open-text.svg';
import IconCerrarSesion from '../assets/power.svg';

const GestionInventario = ({ setVistaActual, onLogout }) => {
const Botones = [
    { imagen: IconInicio, texto: "Inicio", accion: () => setVistaActual('inicio') },
    { imagen: IconUsuario, texto: "Usuarios", accion: () => setVistaActual('usuarios') },
    { imagen: IconInventario, texto: "Inventario", accion: () => setVistaActual('inventario') },
    { imagen: IconConfig, texto: "Configuracion", accion: () => alert('Configuración') },
    { imagen: IconOrdenes, texto: "Ordenes", accion: () => setVistaActual('ordenes') },
    { imagen: IconCerrarSesion, texto: "Cerrar sesion", accion: onLogout },
];

const [formData, setFormData] = useState({
    nombreProducto: '',
    codigo: '', // Si usas códigos como ID o nombres secundarios
    precio: '',
    stock: '',
    categoria: ''
});

const [productos, setProductos] = useState([]);

useEffect(() => {
    // Datos cargados exactamente como se ven en tu imagen
    const datosImagen = [
    { id: 1, nombre: 'CRW-001JB-9', categoria: 'Anillo', precio: 4899, stock: 2 },
    { id: 2, nombre: 'GM-H5600-1', categoria: 'Reloj', precio: 8549, stock: 1 },
    { id: 3, nombre: 'GST-B1000D-1A', categoria: 'Reloj', precio: 21499, stock: 4 },
    { id: 4, nombre: 'SmoonwatchP', categoria: 'Reloj', precio: 216100, stock: 10 },
    { id: 5, nombre: 'SLA079', categoria: 'Reloj', precio: 57489, stock: 2 },
    { id: 6, nombre: 'Seiko GS', categoria: 'Reloj', precio: 25347, stock: 3 },
    { id: 7, nombre: 'marine Star', categoria: 'Reloj', precio: 6286, stock: 1 },
    ];
    setProductos(datosImagen);
}, []);

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};

const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombreProducto || !formData.precio || !formData.stock) return;

    const nuevoProd = {
    id: productos.length + 1,
    nombre: formData.nombreProducto,
    categoria: formData.categoria || 'Reloj',
    precio: parseFloat(formData.precio),
    stock: parseInt(formData.stock)
    };

    setProductos([...productos, nuevoProd]);
    setFormData({ nombreProducto: '', codigo: '', precio: '', stock: '', categoria: '' });
};

return (
    <div className="dashboard-layout">
    <BarraLateral botones={Botones} />

    <div className="dashboard-main-content">
        <div className="inventario-content-layout">
        
        <div className="formulario-seccion">
            <div className="card-formulario-inventario">
            <h2 className="titulo-formulario">Agregar nuevo Producto</h2>
            <form onSubmit={handleSubmit} className="form-content">
                <div className="form-group">
                <label>Product Name / Model</label>
                <input type="text" name="nombreProducto" value={formData.nombreProducto} onChange={handleChange} placeholder="Ej. GM-H5600-1" />
                </div>
                <div className="form-group">
                <label>Price</label>
                <input type="number" name="precio" value={formData.precio} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-group">
                <label>Unidades / Stock</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Cantidad" />
                </div>
                <div className="form-group">
                <label>Category</label>
                <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} placeholder="Ej. Reloj, Anillo" />
                </div>
                <div className="contenedor-boton">
                <button type="submit" className="btn-add-product">Add Product</button>
                </div>
            </form>
            </div>
        </div>

          {/* COLUMNA DERECHA: Renderizado idéntico a tu nueva imagen */}
        <div className="tabla-seccion">
            
            {/* Controles Superiores de la Imagen */}
            <div className="inventario-controles-superiores">
            <button className="btn-control-verde btn-dropdown">
                Categorias 
                <span className="flecha-dropdown">▼</span>
            </button>
            <button className="btn-control-verde">
                Buscar Productos
            </button>
            </div>

            {/* Contenedor de la Tabla Estilizada */}
            <div className="contenedor-tabla-imagen">
            <table className="tabla-estilo-imagen">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th>Unidades</th>
                </tr>
                </thead>
                <tbody>
                {productos.map((prod) => (
                    <tr key={prod.id}>
                    <td className="col-id">{prod.id}</td>
                    <td className="col-name">{prod.nombre}</td>
                    <td className="col-categoria">( {prod.categoria} )</td>
                    <td className="col-precio">${prod.precio.toLocaleString()}</td>
                    <td className="col-unidades">( {prod.stock} )</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>

        </div>

        </div>
    </div>
    </div>
);
};

export default GestionInventario;