import { useState, useEffect } from 'react';
import '../styles/inventario.css';
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from '../services/api';

const CATEGORIAS = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Alimentos', 'Otros'];

const FORM_VACIO = {
  nombreProducto: '', codigo: '', precio: '', stock: '',
  categoria: 'Otros', imageUrl: '', enOferta: false, descuento: 0, descripcion: '',
};

const GestionInventario = () => {
  const [formData, setFormData]   = useState(FORM_VACIO);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState(null);
  const [exito, setExito]         = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProductos({ limite: 200 });
      setProductos(Array.isArray(data) ? data : (data.datos || []));
      setError(null);
    } catch {
      setError('No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarProductos(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => { setFormData(FORM_VACIO); setEditandoId(null); setError(null); };

  const mostrarExito = (msg) => { setExito(msg); setTimeout(() => setExito(''), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombreProducto || !formData.codigo || !formData.precio || !formData.stock) {
      return setError('Nombre, SKU, precio y stock son obligatorios.');
    }

    const payload = {
      nombre:      formData.nombreProducto,
      sku:         formData.codigo,
      precio:      parseFloat(formData.precio),
      stock:       parseInt(formData.stock),
      categoria:   formData.categoria,
      imageUrl:    formData.imageUrl.trim(),
      enOferta:    formData.enOferta,
      descuento:   formData.enOferta ? parseFloat(formData.descuento) || 0 : 0,
      descripcion: formData.descripcion.trim(),
    };

    try {
      if (editandoId) {
        await actualizarProducto(editandoId, payload);
        mostrarExito('Producto actualizado correctamente.');
      } else {
        await crearProducto(payload);
        mostrarExito('Producto creado correctamente.');
      }
      resetForm();
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el producto.');
    }
  };

  const handleEdit = (prod) => {
    setFormData({
      nombreProducto: prod.nombre      || '',
      codigo:         prod.sku         || '',
      precio:         prod.precio      ?? '',
      stock:          prod.stock       ?? '',
      categoria:      prod.categoria   || 'Otros',
      imageUrl:       prod.imageUrl    || '',
      enOferta:       prod.enOferta    || false,
      descuento:      prod.descuento   || 0,
      descripcion:    prod.descripcion || '',
    });
    setEditandoId(prod._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await eliminarProducto(id);
      setProductos(prev => prev.filter(p => p._id !== id));
      mostrarExito('Producto eliminado.');
      if (editandoId === id) resetForm();
    } catch {
      setError('No se pudo eliminar el producto.');
    }
  };

  return (
    <div className="dashboard-main-content">
      <header className="dashboard-header">
        <div>
          <h1>Gestión de Inventario</h1>
          <p>{productos.length} producto(s) en el sistema.</p>
        </div>
      </header>

      <div className="inventario-content-layout">
        {/* ── FORMULARIO ── */}
        <div className="formulario-seccion">
          <div className={`card-formulario-inventario ${editandoId ? 'modo-edicion' : ''}`}>
            <h2 className="titulo-formulario">
              {editandoId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h2>

            {error  && <div className="inv-alert error">{error}</div>}
            {exito  && <div className="inv-alert exito">{exito}</div>}

            <form onSubmit={handleSubmit} className="form-content">
              <div className="form-group">
                <label>Nombre / Modelo</label>
                <input type="text" name="nombreProducto" value={formData.nombreProducto}
                  onChange={handleChange} placeholder="Ej. Rolex Submariner" />
              </div>
              <div className="form-group">
                <label>SKU / Código</label>
                <input type="text" name="codigo" value={formData.codigo}
                  onChange={handleChange} placeholder="Ej. RLX-SUB-001" />
              </div>
              <div className="inv-row">
                <div className="form-group">
                  <label>Precio (MXN)</label>
                  <input type="number" name="precio" value={formData.precio}
                    onChange={handleChange} placeholder="0.00" min="0" />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" name="stock" value={formData.stock}
                    onChange={handleChange} placeholder="0" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange}
                  className="form-select">
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>URL de imagen</label>
                <input type="url" name="imageUrl" value={formData.imageUrl}
                  onChange={handleChange} placeholder="https://..." />
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="preview"
                    className="img-preview"
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div className="form-group">
                <label>Descripción (opcional)</label>
                <textarea name="descripcion" value={formData.descripcion}
                  onChange={handleChange} placeholder="Breve descripción del producto..."
                  rows={2} className="form-textarea" />
              </div>

              {/* ── Sección oferta ── */}
              <div className="oferta-toggle">
                <label className="toggle-label">
                  <input type="checkbox" name="enOferta" checked={formData.enOferta}
                    onChange={handleChange} />
                  <span className="toggle-text">🏷️ Marcar como oferta</span>
                </label>
              </div>
              {formData.enOferta && (
                <div className="form-group">
                  <label>Descuento (%)</label>
                  <input type="number" name="descuento" value={formData.descuento}
                    onChange={handleChange} min="1" max="99" placeholder="Ej. 20" />
                  {formData.precio && formData.descuento > 0 && (
                    <small className="precio-calculado">
                      Precio final: ${(parseFloat(formData.precio) * (1 - formData.descuento / 100)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </small>
                  )}
                </div>
              )}

              <div className="contenedor-boton">
                <button type="submit" className={`btn-add-product ${editandoId ? 'btn-update' : ''}`}>
                  {editandoId ? 'Guardar cambios' : 'Crear producto'}
                </button>
                {editandoId && (
                  <button type="button" onClick={resetForm} className="btn-cancelar-inv">Cancelar</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── TABLA ── */}
        <div className="tabla-seccion">
          <div className="inventario-controles-superiores">
            <span className="inv-titulo-tabla">Productos en inventario</span>
            <button className="btn-control-verde" onClick={cargarProductos}>↺ Recargar</button>
          </div>

          {cargando ? <p className="cargando-msg">Cargando productos...</p> : (
            <div className="contenedor-tabla-imagen">
              <table className="tabla-estilo-imagen">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>SKU</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Oferta</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No hay productos registrados.
                    </td></tr>
                  ) : productos.map(prod => (
                    <tr key={prod._id} className={editandoId === prod._id ? 'fila-activa' : ''}>
                      <td className="col-img">
                        {prod.imageUrl
                          ? <img src={prod.imageUrl} alt={prod.nombre} className="tabla-img"
                              onError={e => { e.target.style.display = 'none'; }} />
                          : <span className="sin-img">📦</span>}
                      </td>
                      <td className="col-id">{prod.sku}</td>
                      <td className="col-name">{prod.nombre}</td>
                      <td className="col-categoria">{prod.categoria}</td>
                      <td className="col-precio">${(prod.precio ?? 0).toLocaleString('es-MX')}</td>
                      <td className="col-unidades">
                        <span className={`inv-stock-badge ${prod.stock === 0 ? 'agotado' : prod.stockBajo ? 'bajo' : 'ok'}`}>
                          {prod.stock}
                        </span>
                      </td>
                      <td className="col-oferta">
                        {prod.enOferta
                          ? <span className="inv-oferta-badge">-{prod.descuento}%</span>
                          : <span className="inv-sin-oferta">—</span>}
                      </td>
                      <td className="col-acciones">
                        <button onClick={() => handleEdit(prod)} className="btn-editar">✏️</button>
                        <button onClick={() => handleDelete(prod._id, prod.nombre)} className="btn-eliminar">🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionInventario;
