import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Componente Principal que contiene todo (Dashboard + Barra Lateral + Tarjetas)
import AdminDash from './modulos-jsx/AdminDashboard.jsx';
import GestionUsuarios from './modulos-jsx/AdminUsuarios.jsx';
import GestionInventario from './modulos-jsx/Inventario.jsx';
import GestionOrdenes from './modulos-jsx/GestionOrdenes.jsx';
import App from './modulos-jsx/userDashboard.jsx';
import LoginRegister from './modulos-jsx/login-register.jsx';
import Carrito from './modulos-jsx/carrito.jsx';

// Estilos globales de la aplicación (si tienes uno, ej: index.css)
// import './styles/index.css'; 

createRoot(document.getElementById('root')).render(
<StrictMode>
    <Carrito/>
</StrictMode>
);