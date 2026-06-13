import { useState, useEffect } from 'react';
import { obtenerOrdenesApi, actualizarOrdenApi } from '../services/ordenService';
import '../styles/GestionOrdenes.css';

const ESTADOS = ['pendiente', 'procesando', 'enviado', 'completado', 'cancelado'];

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   cls: 'estado-pendiente' },
  procesando:  { label: 'Procesando',  cls: 'estado-procesando' },
  enviado:     { label: 'Enviado',     cls: 'estado-enviado' },
  completado:  { label: 'Completado',  cls: 'estado-completado' },
  cancelado:   { label: 'Cancelado',   cls: 'estado-cancelado' },
};

const formatFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const GestionOrdenes = () => {
  const [ordenes, setOrdenes]       = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState('');
  const [expandida, setExpandida]   = useState(null); // id de la orden con items visibles
  const [actualizando, setActualizando] = useState(null); // id de la orden en proceso

  const cargarOrdenes = async () => {
    try {
      setCargando(true);
      setError('');
      const datos = await obtenerOrdenesApi();
      setOrdenes(datos);
    } catch {
      setError('No se pudieron cargar las órdenes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarOrdenes(); }, []);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    if (nuevoEstado === 'cancelado') {
      if (!window.confirm(
        '¿Cancelar esta orden? El stock de los productos se restaurará automáticamente.'
      )) return;
    }
    setActualizando(id);
    try {
      const actualizada = await actualizarOrdenApi(id, nuevoEstado);
      setOrdenes(prev =>
        prev.map(o => o._id === id ? { ...o, estado: actualizada.estado } : o)
      );
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al actualizar la orden.');
    } finally {
      setActualizando(null);
    }
  };

  const pendientes  = ordenes.filter(o => o.estado === 'pendiente').length;
  const totalVentas = ordenes
    .filter(o => o.estado !== 'cancelado')
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="dashboard-main-content">
      <header className="dashboard-header">
        <div>
          <h1>Gestión de Órdenes</h1>
          <p>{ordenes.length} orden(es) registrada(s) · {pendientes} pendiente(s)</p>
        </div>
        <div className="ordenes-header-badges">
          <span className="header-badge-num">
            💰 Ventas totales: <strong>${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
          </span>
          <button className="btn-refresh-ordenes" onClick={cargarOrdenes}>↺ Recargar</button>
        </div>
      </header>

      {error && <div className="ordenes-alert">{error}</div>}

      <div className="ordenes-view-container">
        {cargando ? (
          <div className="ordenes-skeleton">
            {Array(4).fill(null).map((_, i) => (
              <div key={i} className="skeleton-orden-row" />
            ))}
          </div>
        ) : ordenes.length === 0 ? (
          <div className="ordenes-vacio">
            <span>📦</span>
            <p>Aún no hay órdenes registradas.</p>
            <small>Las compras de los usuarios aparecerán aquí.</small>
          </div>
        ) : (
          <div className="tabla-marco-azul">
            <table className="tabla-ordenes">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden, idx) => {
                  const cfg      = ESTADO_CONFIG[orden.estado] || ESTADO_CONFIG.pendiente;
                  const abierta  = expandida === orden._id;
                  const bloqueado = actualizando === orden._id;

                  return (
                    <>
                      <tr
                        key={orden._id}
                        className={`fila-orden ${abierta ? 'fila-expandida' : ''}`}
                      >
                        <td className="td-num">{idx + 1}</td>
                        <td className="td-cliente">
                          <span className="cliente-nombre">{orden.nombreCliente}</span>
                          <span className="cliente-email">{orden.emailCliente}</span>
                        </td>
                        <td className="td-items">
                          <button
                            className="btn-ver-items"
                            onClick={() => setExpandida(abierta ? null : orden._id)}
                          >
                            {orden.items.length} art. {abierta ? '▲' : '▼'}
                          </button>
                        </td>
                        <td className="td-total">
                          ${orden.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="td-estado">
                          <span className={`badge-estado ${cfg.cls}`}>{cfg.label}</span>
                        </td>
                        <td className="td-fecha">{formatFecha(orden.createdAt)}</td>
                        <td className="td-acciones">
                          <select
                            className="select-estado"
                            value={orden.estado}
                            disabled={bloqueado || orden.estado === 'cancelado'}
                            onChange={e => handleCambiarEstado(orden._id, e.target.value)}
                          >
                            {ESTADOS.map(e => (
                              <option key={e} value={e}
                                disabled={e === orden.estado}>
                                {ESTADO_CONFIG[e].label}
                              </option>
                            ))}
                          </select>
                          {bloqueado && <span className="spinner-mini">⏳</span>}
                        </td>
                      </tr>

                      {/* Fila expandida con detalle de items */}
                      {abierta && (
                        <tr key={`${orden._id}-items`} className="fila-detalle">
                          <td colSpan="7">
                            <div className="detalle-items">
                              <table className="tabla-items-detalle">
                                <thead>
                                  <tr>
                                    <th>Imagen</th>
                                    <th>Producto</th>
                                    <th>SKU</th>
                                    <th>Precio unit.</th>
                                    <th>Cantidad</th>
                                    <th>Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orden.items.map((item, i) => (
                                    <tr key={i}>
                                      <td>
                                        {item.imageUrl
                                          ? <img src={item.imageUrl} alt={item.nombre}
                                              className="item-detalle-img"
                                              onError={e => { e.target.style.display = 'none'; }} />
                                          : <span>📦</span>}
                                      </td>
                                      <td className="item-nombre">{item.nombre}</td>
                                      <td className="item-sku">{item.sku}</td>
                                      <td>
                                        {item.precioFinal < item.precio && (
                                          <s className="precio-original-detalle">
                                            ${item.precio.toLocaleString('es-MX')}
                                          </s>
                                        )}
                                        <span> ${item.precioFinal.toLocaleString('es-MX')}</span>
                                      </td>
                                      <td>{item.cantidad}</td>
                                      <td><strong>${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionOrdenes;
