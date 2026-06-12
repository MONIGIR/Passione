import { useState, useEffect } from 'react';
import '../styles/GestionOrdenes.css';


const GestionOrdenes = ({ setVistaActual, onLogout }) => {
  // Configuración de botones para la Barra Lateral según tu imagen


  // Estado para las órdenes (conectado a Postgres en el futuro)
const [ordenes, setOrdenes] = useState([]);

  // 1. OBTENER ÓRDENES (Simulación GET de Postgres)
useEffect(() => {
    const datosSimulados = [
    { id: 1, nombre: 'Alan Brito', direccion: 'Av. Siempre Viva 123', producto: 'Monitor Gamer', categoria: 'Hardware', cantidad: 1, total: 4500, fecha: '2023-10-24' },
    { id: 2, nombre: 'Elena Nito', direccion: 'Calle Falsa 456', producto: 'Teclado Mecánico', categoria: 'Periféricos', cantidad: 2, total: 2400, fecha: '2023-10-25' },
    ];
    setOrdenes(datosSimulados);
}, []);

  // 2. CANCELAR ORDEN (Simulación DELETE en Postgres)
const cancelarOrden = (id) => {
    if (window.confirm(`¿Estás seguro de cancelar la orden ID: ${id}?`)) {
      // fetch(`/api/ordenes/${id}`, { method: 'DELETE' })
    setOrdenes(ordenes.filter(orden => orden.id !== id));
    console.log(`Orden ${id} cancelada en la base de datos.`);
    }
};

return (
    <div className="dashboard-layout">

    <div className="dashboard-main-content">
        <div className="ordenes-view-container">
        
        {/* Título opcional fuera del recuadro si lo deseas, 
              pero la imagen muestra la tabla directamente en el marco azul */}
        
        <div className="tabla-marco-azul">
            <table className="tabla-ordenes">
            <thead>
                <tr>
                <th>ID</th>
                <th>NOMBRE</th>
                <th>DIRECCION</th>
                <th>NOMBRE DEL PRODUCTO</th>
                <th>CATEGORIA</th>
                <th>CANTIDAD</th>
                <th>TOTAL</th>
                <th>FECHA DE LA ORDEN</th>
                  <th>ACCIÓN</th> {/* Columna extra para el botón de cancelar */}
                </tr>
            </thead>
            <tbody>
                {ordenes.length === 0 ? (
                  // Filas vacías como en tu imagen de referencia
                [1, 2, 3].map((i) => (
                    <tr key={i}>
                    <td>{i}</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    </tr>
                ))
                ) : (
                ordenes.map((orden) => (
                    <tr key={orden.id}>
                    <td>{orden.id}</td>
                    <td>{orden.nombre}</td>
                    <td>{orden.direccion}</td>
                    <td>{orden.producto}</td>
                    <td>{orden.categoria}</td>
                    <td>{orden.cantidad}</td>
                    <td>${orden.total}</td>
                    <td>{orden.fecha}</td>
                    <td>
                        <button 
                        className="btn-cancelar" 
                        onClick={() => cancelarOrden(orden.id)}
                        >
                        Cancelar
                        </button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        </div>
    </div>
    </div>
);
};

export default GestionOrdenes;