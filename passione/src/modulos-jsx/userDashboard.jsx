import { useState, useEffect, useMemo } from 'react';
import '../styles/user.css';
import Carrito from './carrito';
import Perfil from './Perfil';
import BarraLateral from './barraLateral';
import { obtenerProductos } from '../services/api';
import IconoUsuario   from '../assets/user.svg';
import IconoCarrito   from '../assets/shopping-cart.svg';
import IconoCerrar    from '../assets/power.svg';
import IconoInicio    from '../assets/house.svg';
import IconoOfertas   from '../assets/package.svg';

// ─── BADGE DE STOCK ─────────────────────────────────────────
const StockBadge = ({ producto }) => {
  if (producto.stock === 0)
    return <span className="badge-stock agotado">Agotado</span>;
  if (producto.stockBajo)
    return <span className="badge-stock bajo">Solo {producto.stock} restantes</span>;
  return <span className="badge-stock ok">{producto.stock} disponibles</span>;
};

// ─── CARD DE PRODUCTO ────────────────────────────────────────
export const ProductoCard = ({ producto, onAgregar }) => {
  const sinStock = producto.stock === 0;
  const precioFinal = producto.precioFinal ?? producto.precio;

  return (
    <div className={`CartaProducto ${producto.enOferta ? 'en-oferta' : ''}`}>
      <div className="ContenedorImagen">
        {producto.imageUrl
          ? <img src={producto.imageUrl} alt={producto.nombre} className="Imagen-producto" />
          : <div className="placeholder-img">📦</div>}
        {producto.enOferta && (
          <span className="badge-descuento">-{producto.descuento}%</span>
        )}
        <StockBadge producto={producto} />
      </div>

      <div className="ContenedorTexto">
        <h3 className="titulo">{producto.nombre}</h3>
        <p className="Modelo">{producto.categoria}</p>
        {producto.enOferta ? (
          <div className="precio-oferta-container">
            <span className="precio-tachado">${producto.precio.toLocaleString('es-MX')}</span>
            <span className="precio-final">${precioFinal.toLocaleString('es-MX')}</span>
          </div>
        ) : (
          <p className="Precio">${producto.precio.toLocaleString('es-MX')}</p>
        )}
      </div>

      <div className="ContenedorAcciones">
        <button
          className="btn-agregar"
          onClick={() => onAgregar(producto)}
          disabled={sinStock}
        >
          {sinStock ? 'Sin stock' : '+ Agregar al carrito'}
        </button>
      </div>
    </div>
  );
};

// ─── SECCIÓN CATÁLOGO ────────────────────────────────────────
const SeccionCatalogo = ({ productos, cargando, onAgregar, usuario }) => {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() =>
    productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase())
    ), [productos, busqueda]);

  return (
    <div className="seccion-contenido">
      <header className="user-header">
        <div>
          <h1>Hola, {usuario?.nombre?.split(' ')[0]} 👋</h1>
          <p className="user-sub">Descubre nuestra colección exclusiva.</p>
        </div>
        <div className="buscador-container">
          <input
            className="buscador"
            type="text"
            placeholder="Buscar producto o categoría..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      {cargando ? (
        <div className="grid-skeleton">
          {Array(8).fill(null).map((_, i) => <div key={i} className="skeleton-card-producto" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="vacio-msg">
          <p>No se encontraron productos{busqueda ? ` para "${busqueda}"` : ''}.</p>
        </div>
      ) : (
        <div className="mainGrid">
          {filtrados.map((p, i) => (
            <ProductoCard
              key={p._id}
              producto={p}
              onAgregar={onAgregar}
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SECCIÓN OFERTAS ─────────────────────────────────────────
const SeccionOfertas = ({ ofertas, cargando, onAgregar }) => (
  <div className="seccion-contenido">
    <header className="user-header">
      <div>
        <h1>🏷️ Ofertas especiales</h1>
        <p className="user-sub">{ofertas.length} producto(s) con descuento activo.</p>
      </div>
    </header>

    {cargando ? (
      <div className="grid-skeleton">
        {Array(4).fill(null).map((_, i) => <div key={i} className="skeleton-card-producto" />)}
      </div>
    ) : ofertas.length === 0 ? (
      <div className="vacio-msg ofertas-vacio">
        <span className="vacio-icon">🏷️</span>
        <p>No hay ofertas activas en este momento.</p>
        <small>El administrador puede configurarlas desde el panel.</small>
      </div>
    ) : (
      <div className="mainGrid">
        {ofertas.map(p => (
          <ProductoCard key={p._id} producto={p} onAgregar={onAgregar} />
        ))}
      </div>
    )}
  </div>
);

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────
const App = ({ usuario, onLogout }) => {
  const [vistaActual, setVistaActual]       = useState('catalogo');
  const [productos, setProductos]           = useState([]);
  const [cargando, setCargando]             = useState(true);
  const [carrito, setCarrito]               = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [usuarioActual, setUsuarioActual]   = useState(usuario);

  useEffect(() => {
    obtenerProductos({ activo: true, limite: 100 })
      .then(data => setProductos(data.datos || []))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const ofertas = useMemo(() => productos.filter(p => p.enOferta), [productos]);

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i._id === producto._id);
      if (existe) return prev.map(i => i._id === producto._id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const eliminarDelCarrito = (id) => setCarrito(prev => prev.filter(i => i._id !== id));
  const limpiarCarrito     = ()   => setCarrito([]);

  const totalArticulos = carrito.reduce((acc, i) => acc + (i.cantidad || 1), 0);

  const Botones = [
    { imagen: IconoInicio,  texto: 'catalogo', accion: () => setVistaActual('catalogo') },
    { imagen: IconoOfertas, texto: 'ofertas',  accion: () => setVistaActual('ofertas'),
      count: ofertas.length },
    { imagen: IconoUsuario, texto: 'perfil',   accion: () => setVistaActual('perfil') },
    { imagen: IconoCarrito, texto: 'carrito',  accion: () => setMostrarCarrito(v => !v),
      count: totalArticulos },
    { imagen: IconoCerrar,  texto: 'salir',    accion: onLogout },
  ];

  const renderContenido = () => {
    switch (vistaActual) {
      case 'ofertas':
        return <SeccionOfertas ofertas={ofertas} cargando={cargando} onAgregar={agregarAlCarrito} />;
      case 'perfil':
        return <Perfil usuario={usuarioActual} onActualizar={setUsuarioActual} />;
      default:
        return (
          <SeccionCatalogo
            productos={productos}
            cargando={cargando}
            onAgregar={agregarAlCarrito}
            usuario={usuarioActual}
          />
        );
    }
  };

  // Mapeo para que BarraLateral resalte el tab activo correctamente
  const labelActivo = vistaActual;

  return (
    <div className="ContenedorPrincipal">
      <BarraLateral botones={Botones} vistaActual={labelActivo} />

      {renderContenido()}

      {mostrarCarrito && (
        <>
          <div className="PopupOverlay" onClick={() => setMostrarCarrito(false)} />
          <div className="PopUpCarrito">
            <button className="CerrarPopUpCarrito" onClick={() => setMostrarCarrito(false)}>×</button>
            <Carrito
              items={carrito}
              onEliminar={eliminarDelCarrito}
              onLimpiarCarrito={limpiarCarrito}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
