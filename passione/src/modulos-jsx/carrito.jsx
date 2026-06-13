import { useState } from 'react';
import { crearOrdenApi } from '../services/ordenService';
import '../styles/Carrito.css';

const Carrito = ({ items, onEliminar, onLimpiarCarrito }) => {
  const [cargando, setCargando]         = useState(false);
  const [error, setError]               = useState('');
  const [ordenCreada, setOrdenCreada]   = useState(null);

  const total = items.reduce((acc, item) => {
    const precio = item.precioFinal ?? item.precio ?? 0;
    return acc + precio * (item.cantidad || 1);
  }, 0);

  const handleCompra = async () => {
    if (items.length === 0) return;
    setError('');
    setCargando(true);
    try {
      const orden = await crearOrdenApi(items);
      setOrdenCreada(orden);
      onLimpiarCarrito(); // vacía el carrito en el estado global
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al procesar la compra. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // ── Pantalla de éxito ──────────────────────────────────────
  if (ordenCreada) {
    return (
      <div className="ContenedorCarrito compra-exitosa">
        <div className="exito-icono">✅</div>
        <h2 className="exito-titulo">¡Compra realizada!</h2>
        <p className="exito-sub">Tu pedido ha sido registrado correctamente.</p>
        <div className="exito-detalle">
          <span>Total pagado:</span>
          <strong>${ordenCreada.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
        </div>
        <p className="exito-hint">El administrador procesará tu orden a la brevedad.</p>
        <button className="btn-comprar" onClick={() => setOrdenCreada(null)}>
          Seguir comprando
        </button>
      </div>
    );
  }

  // ── Carrito vacío ──────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="ContenedorCarrito carrito-vacio">
        <div className="vacio-icono">🛒</div>
        <p>Tu carrito está vacío.</p>
      </div>
    );
  }

  // ── Carrito con items ──────────────────────────────────────
  return (
    <div className="ContenedorCarrito">
      <h2 className="carrito-titulo">Tu carrito</h2>

      <div className="ListaProductosCarrito">
        {items.map(item => {
          const precioUnitario = item.precioFinal ?? item.precio ?? 0;
          return (
            <div key={item._id} className="ItemCarrito">
              <div className="item-img-wrap">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.nombre} className="ImagenMini" />
                  : <span className="item-placeholder">📦</span>}
              </div>
              <div className="InfoItem">
                <h4>{item.nombre}</h4>
                <span className="item-cat">{item.categoria}</span>
                <p className="PrecioItem">
                  ${precioUnitario.toLocaleString('es-MX')} × {item.cantidad}
                </p>
              </div>
              <button
                className="btn-eliminar-item"
                onClick={() => onEliminar(item._id)}
                title="Quitar del carrito"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="carrito-resumen">
        <div className="resumen-fila">
          <span>Artículos:</span>
          <span>{items.reduce((a, i) => a + i.cantidad, 0)}</span>
        </div>
        <div className="resumen-fila total">
          <span>Total:</span>
          <strong>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      {error && <p className="carrito-error">{error}</p>}

      <div className="AccionesCarrito">
        <button
          className="btn-comprar"
          onClick={handleCompra}
          disabled={cargando}
        >
          {cargando ? 'Procesando...' : '💳 Finalizar compra'}
        </button>
        <button className="btn-vaciar" onClick={onLimpiarCarrito}>
          Vaciar carrito
        </button>
      </div>
    </div>
  );
};

export default Carrito;
