import { useState, useEffect } from 'react';
import '../styles/inventario.css';
import { obtenerProductos, crearProducto, eliminarProducto } from '../services/api';

const GestionInventario = ({ setVistaActual, onLogout }) => {

  const [formData, setFormData] = useState({
    nombreProducto: '',
    codigo: '',
    precio: '',
    stock: '',
    categoria: ''
  });

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProductos();
      const lista = Array.isArray(data) ? data : (data.datos || []);
      setProductos(lista);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({ nombreProducto: '', codigo: '', precio: '', stock: '', categoria: '' });
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombreProducto || !formData.codigo || !formData.precio || !formData.stock) {
      setError('Completa nombre, SKU, precio y stock.');
      return;
    }

    const payload = {
      nombre: formData.nombreProducto,
      sku: formData.codigo,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      categoria: formData.categoria || 'Otros'
    };

    try {
      if (editandoId) {
        await actualizarProducto(editandoId, payload);
      } else {
        await crearProducto(payload);
      }
      resetForm();
      setError(null);
      cargarProductos();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.mensaje || 'Revisa los campos.';
      setError(`No se pudo guardar el producto. ${msg}`);
    }
  };

  const handleEdit = (prod) => {
    setFormData({
      nombreProducto: prod.nombre || '',
      codigo: prod.sku || '',
      precio: prod.precio ?? '',
      stock: prod.stock ?? '',
      categoria: prod.categoria || ''
    });
    setEditandoId(prod._id);
  };

  const handleDelete = async (id) => {
    try {
      await eliminarProducto(id);
      setProductos(productos.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el producto.');
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main-content">
        <div className="inventario-content-layout">

          <div className="formulario-seccion">
            <div className="card-formulario-inventario">
              <h2 className="titulo-formulario">
                {editandoId ? 'Editar Producto' : 'Agregar nuevo Producto'}
              </h2>
              <form onSubmit={handleSubmit} className="form-content">
                <div className="form-group">
                  <label>Product Name / Model</label>
                  <input type="text" name="nombreProducto" value={formData.nombreProducto} onChange={handleChange} placeholder="Ej. GM-H5600-1" />
                </div>
                <div className="form-group">
                  <label>SKU / Código</label>
                  <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej. RJ-001" />
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
                  <button type="submit" className="btn-add-product">
                    {editandoId ? 'Guardar cambios' : 'Add Product'}
                  </button>
                  {editandoId && (
                    <button type="button" onClick={resetForm} className="btn-cancelar">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="tabla-seccion">
            <div className="inventario-controles-superiores">
              <button className="btn-control-verde btn-dropdown">
                Categorias <span className="flecha-dropdown">▼</span>
              </button>
              <button className="btn-control-verde">Buscar Productos</button>
            </div>

            {cargando && <p>Cargando productos...</p>}
            {error && <p className="error-mensaje">{error}</p>}

            <div className="contenedor-tabla-imagen">
              <table className="tabla-estilo-imagen">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th>Unidades</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => (
                    <tr key={prod._id}>
                      <td className="col-id">{prod.sku}</td>
                      <td className="col-name">{prod.nombre}</td>
                      <td className="col-categoria">( {prod.categoria} )</td>
                      <td className="col-precio">${(prod.precio ?? 0).toLocaleString()}</td>
                      <td className="col-unidades">( {prod.stock} )</td>
                      <td className="col-acciones">
                        <button onClick={() => handleEdit(prod)} className="btn-editar">✏️</button>
                        <button onClick={() => handleDelete(prod._id)} className="btn-eliminar">🗑</button>
                      </td>
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