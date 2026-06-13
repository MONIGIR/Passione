import { useEffect, useState } from 'react';
import BarraLateral from './barraLateral';
import InfoCarta from './BoxCards';
import GestionUsuarios from './AdminUsuarios';
import GestionInventario from './Inventario';
import GestionOrdenes from './GestionOrdenes';
import { obtenerStatsApi } from '../services/usuarioService';
import '../styles/AdminDashBoard.css';
import '../styles/BarraLateral.css';
import IconUsuario from '../assets/user.svg';
import IconInicio from '../assets/house.svg';
import IconInventario from '../assets/book-open-text.svg';
import IconOrdenes from '../assets/package.svg';
import IconCerrarSesion from '../assets/power.svg';

const AdminDash = ({ onLogout }) => {
  const [vistaActual, setVistaActual] = useState('inicio');
  const [stats, setStats] = useState({ totalUsuarios: 0, totalAdmins: 0, totalProductos: 0, stockBajo: 0 });
  const [cargandoStats, setCargandoStats] = useState(true);

  useEffect(() => {
    obtenerStatsApi()
      .then(setStats)
      .catch(console.error)
      .finally(() => setCargandoStats(false));
  }, []);

  const Botones = [
    { imagen: IconInicio,       texto: 'Inicio',        accion: () => setVistaActual('inicio') },
    { imagen: IconUsuario,      texto: 'Usuarios',      accion: () => setVistaActual('usuarios') },
    { imagen: IconInventario,   texto: 'Inventario',    accion: () => setVistaActual('inventario') },
    { imagen: IconOrdenes,      texto: 'Órdenes',       accion: () => setVistaActual('ordenes') },
    { imagen: IconCerrarSesion, texto: 'Cerrar sesión', accion: onLogout },
  ];

  const renderContenido = () => {
    switch (vistaActual) {
      case 'usuarios':
        return <GestionUsuarios setVistaActual={setVistaActual} />;
      case 'inventario':
        return <GestionInventario setVistaActual={setVistaActual} />;
      case 'ordenes':
        return <GestionOrdenes setVistaActual={setVistaActual} />;
      default:
        return (
          <div className="dashboard-main-content" key="inicio">
            <header className="dashboard-header">
              <div>
                <h1>Panel de Administración</h1>
                <p>Estado actual del sistema en tiempo real.</p>
              </div>
              <div className="header-badge">
                <span className="status-dot" />
                Sistema operativo
              </div>
            </header>

            <div className="metrics-grid">
              {cargandoStats ? (
                Array(4).fill(null).map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))
              ) : (
                <>
                  <InfoCarta title="Usuarios Totales"   value={stats.totalUsuarios}  icon="👥" type="primary" />
                  <InfoCarta title="Administradores"    value={stats.totalAdmins}    icon="🛡️" type="success" />
                  <InfoCarta title="Productos Activos"  value={stats.totalProductos} icon="📦" type="warning" />
                  <InfoCarta title="Stock Bajo"         value={stats.stockBajo}      icon="⚠️" type="danger" />
                </>
              )}
            </div>

            <div className="detailed-section">
              <div className="large-module">
                <h3>Accesos rápidos</h3>
                <div className="quick-actions">
                  <button className="qa-btn" onClick={() => setVistaActual('usuarios')}>
                    <span>👥</span> Gestionar Usuarios
                  </button>
                  <button className="qa-btn" onClick={() => setVistaActual('inventario')}>
                    <span>📦</span> Ver Inventario
                  </button>
                  <button className="qa-btn" onClick={() => setVistaActual('ordenes')}>
                    <span>🧾</span> Ver Órdenes
                  </button>
                </div>
              </div>

              <div className="large-module info-module">
                <h3>Resumen del sistema</h3>
                <ul className="info-list">
                  <li><span className="dot green" /> Base de datos MongoDB conectada</li>
                  <li><span className="dot green" /> API REST activa en puerto 5000</li>
                  <li><span className="dot yellow" />
                    {stats.stockBajo > 0
                      ? `${stats.stockBajo} producto(s) con stock bajo — revisa el inventario`
                      : 'Niveles de stock saludables'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <BarraLateral botones={Botones} vistaActual={vistaActual} />
      {renderContenido()}
    </div>
  );
};

export default AdminDash;
