import { useEffect, useState } from 'react';
import BarraLateral from './barraLateral';
import InfoCarta from './BoxCards';
import '../styles/AdminDashBoard.css';
import '../styles/BarraLateral.css';
import IconUsuario from '../assets/user.svg';
import IconInicio from '../assets/house.svg';
import IconInventario from '../assets/book-open-text.svg';
import IconOrdenes from '../assets/package.svg';
import IconCerrarSesion from '../assets/power.svg';
import GestionUsuarios from './AdminUsuarios';
import GestionInventario from './Inventario';
import GestionOrdenes from './GestionOrdenes';

const AdminDash = ({ onLogout }) => {
  const [vistaActual, setVistaActual] = useState('inicio');
  const [metrics, setMetrics] = useState({
    usersCount: 0,
    activeSessions: 0,
    pendingTasks: 0,
    systemStatus: 'Cargando....'
  });

  const watchData = Array(4).fill({
    imageUrl: "https://via.placeholder.com/150", 
    title: "Rolex",
    model: "Submarine Date",
    price: "A partir de 180,220 MX$"
  }).map((item, index) => ({
    ...item,
    id: `admin-rolex-${index}`
  }));

  useEffect(() => {
    setMetrics({
      usersCount: 1240,
      activeSessions: 85,
      pendingTasks: 12,
      systemStatus: 'Optimo',
    });
  }, []); 

  // Configuración de botones dinámicos con acciones onClick directas
  const Botones = [
    { imagen: IconInicio, texto: "Inicio", accion: () => setVistaActual('inicio') },
    { imagen: IconUsuario,
      texto: "Usuarios",
      accion: () => setVistaActual('usuarios') },
    { imagen: IconInventario, texto: "Inventario", accion: () => setVistaActual('inventario') },
    { imagen: IconOrdenes, texto: "Ordenes", accion: () => setVistaActual('ordenes') },
    { imagen: IconCerrarSesion, texto: "Cerrar sesion", accion: onLogout },
  ];

  // Renderizado condicional basado en el botón presionado
  const renderContenido = () => {
    switch (vistaActual) {
      case 'usuarios':
        return <GestionUsuarios onLogout={onLogout} setVistaActual={setVistaActual} />;
      case 'inventario':
        return <GestionInventario onLogout={onLogout} setVistaActual={setVistaActual} />;
      case 'ordenes':
        return <GestionOrdenes onLogout={onLogout} setVistaActual={setVistaActual} />;
      case 'inicio':
      default:
        return (
          <div className="dashboard-main-content">
            <header className="dashboard-header">
              <h1>Panel de Administración</h1>
              <p>Bienvenido de vuelta. Aquí está el estado actual del sistema.</p>
            </header>
            <div className="metrics-grid">
              <InfoCarta title="Usuarios Totales" value={metrics.usersCount} icon="👥" type="primary" />
              <InfoCarta title="Sesiones Activas" value={metrics.activeSessions} icon="⚡" type="success" />
              <InfoCarta title="Tareas Pendientes" value={metrics.pendingTasks} icon="📋" type="warning" />
              <InfoCarta title="Estado del Servidor" value={metrics.systemStatus} icon="🛠️" type="danger" />
            </div>

            <div className="detailed-section">
              <div className="large-module">
                <h3>Actividad Reciente</h3>
                <p>Espacio reservado para conectar tablas de PostgreSQL o gráficos de rendimiento.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-layout"> 
      <BarraLateral botones={Botones} />
      {renderContenido()}
    </div>
  );
};

export default AdminDash;