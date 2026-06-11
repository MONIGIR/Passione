import { useEffect, useState } from 'react';
import BarraLateral from '../modulos-jsx/barraLateral';
import InfoCarta from './BoxCards';
import '../styles/AdminDashBoard.css';
import '../styles/BarraLateral.css';

// Importación de tus iconos locales desde assets
import IconUsuario from '../assets/user.svg';
import IconInicio from '../assets/house.svg';
import IconInventario from '../assets/book-open-text.svg';
import IconOrdenes from '../assets/book-open-text.svg';
import IconCerrarSesion from '../assets/power.svg';

const AdminDash = () => {
  const [metrics, setMetrics] = useState({
    usersCount: 0,
    activeSessions: 0,
    pendingTasks: 0,
    systemStatus: 'Cargando....'
  });


  useEffect(() => {
    // Aquí conectarás tu fetch hacia Node.js + PostgreSQL en el futuro
    setMetrics({
      usersCount: 1240,
      activeSessions: 85,
      pendingTasks: 12,
      systemStatus: 'Optimo',
    });
  }, []); 



  const Botones = [
    { imagen: IconInicio, texto: "Inicio", enlace: '#' },
    { imagen: IconUsuario, texto: "Usuarios", enlace: '#' },
    { imagen: IconInventario, texto: "Inventario", enlace: '#' },
    { imagen: IconOrdenes, texto: "Ordenes", enlace: '#' },
    { imagen: IconCerrarSesion, texto: "Cerrar sesion", enlace: '#' },
  ];

  return (
    <div className="dashboard-layout"> 
      
      {/* Módulo 1: Barra Lateral de Navegación */}
      <BarraLateral botones={Botones} />

      {/* Módulo 2: Contenedor del contenido del Dashboard */}
      <div className="dashboard-main-content">
        <header className="dashboard-header">
          <h1>Panel de Administración</h1>
          <p>Bienvenido de vuelta. Aquí está el estado actual del sistema.</p>
        </header>

        {/* Cuadrícula que renderiza tus componentes BoxCards */}
        <div className="metrics-grid">
          <InfoCarta title="Usuarios Totales" value={metrics.usersCount} icon="👥" type="primary" />
          <InfoCarta title="Sesiones Activas" value={metrics.activeSessions} icon="⚡" type="success" />
          <InfoCarta title="Tareas Pendientes" value={metrics.pendingTasks} icon="📋" type="warning" />
          <InfoCarta title="Estado del Servidor" value={metrics.systemStatus} icon="🛠️" type="danger" />
        </div>

        {/* Sección inferior para futuras extensiones (tablas SQL de Postgres, etc) */}
        <div className="detailed-section">
          <div className="large-module">
            <h3>Actividad Reciente</h3>
            <p>Espacio reservado para conectar tablas de PostgreSQL o gráficos de rendimiento.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDash;