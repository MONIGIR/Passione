import React from 'react';

export default function DashboardInventario() {
  
  // --- 1. DATOS (Fieles a tu imagen) ---
  const productosSinStock = [
    { codigo: 'CRW-001JB-9', tipo: 'Anillo' },
    { codigo: 'GM-H5600-1', tipo: 'Reloj' },
    { codigo: 'GST-B1000D-1A', tipo: 'Reloj' },
  ];

  const topVentas = [
    { codigo: 'GMW-BZ5000RC-1', tipo: 'Reloj' },
    { codigo: 'GM-B2100SD-1C', tipo: 'Reloj' },
    { codigo: 'CRW-001JB-9', tipo: 'Anillo' },
    { codigo: 'GM-S2110-1A7', tipo: 'Reloj' },
    { codigo: 'GST-B1000D-1A', tipo: 'Reloj' },
  ];

  const bajoStock = [
    { codigo: 'CRW-001JB-9', tipo: 'Anillo', cant: 2 },
    { codigo: 'GM-H5600-1', tipo: 'Reloj', cant: 1 },
    { codigo: 'GST-B1000D-1A', tipo: 'Reloj', cant: 4 },
  ];

  // --- 2. OBJETOS DE ESTILO (CSS dentro de React) ---
  const estilos = {
    contenedor: {
      display: 'flex',
      gap: '30px',
      padding: '40px',
      backgroundColor: '#ffffff',
      fontFamily: 'sans-serif',
      minHeight: '100vh',
    },
    columnaIzquierda: {
      flex: '3', // Ocupa el 75% del ancho
      display: 'flex',
      flexDirection: 'column',
      gap: '35px',
    },
    columnaDerecha: {
      flex: '1', // Ocupa el 25% del ancho
      display: 'flex',
      flexDirection: 'column',
      gap: '25px',
    },
    tarjetaGrande: {
      backgroundColor: '#dbdbdb', // Gris idéntico al de la imagen
      borderRadius: '18px',
      padding: '30px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    },
    tituloTarjeta: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#000000',
      marginTop: '0',
      marginBottom: '20px',
    },
    gridTopVentas: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr', // Divide el "Top Ventas" en dos columnas
      gap: '10px',
    },
    textoProducto: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#000000',
      margin: '8px 0',
    },
    tarjetaMetrica: {
      backgroundColor: '#dbdbdb',
      borderRadius: '18px',
      padding: '20px',
      height: '140px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // Separa el título arriba y el número abajo
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    },
    tituloMetrica: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      maxWidth: '120px', // Limita el ancho para que rompa renglón como en la foto
      lineHeight: '1.2',
    },
    valorMetrica: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'center',
      marginBottom: '10px',
    }
  };

  // --- 3. RENDERIZADO DEL COMPONENTE ---
  return (
    <div style={estilos.contenedor}>
      
      {/* SECCIÓN DE LISTAS (IZQUIERDA) */}
      <div style={estilos.columnaIzquierda}>
        
        {/* Tarjeta: Productos sin stock */}
        <div style={estilos.tarjetaGrande}>
          <h2 style={estilos.tituloTarjeta}>Productos sin stock :</h2>
          {productosSinStock.map((prod, i) => (
            <p key={i} style={estilos.textoProducto}>
              {prod.codigo} <span style={{ color: '#444' }}>( {prod.tipo} )</span>
            </p>
          ))}
        </div>

        {/* Tarjeta: Productos en top ventas */}
        <div style={estilos.tarjetaGrande}>
          <h2 style={estilos.tituloTarjeta}>Productos en top ventas :</h2>
          <div style={estilos.gridTopVentas}>
            {topVentas.map((prod, i) => (
              <p key={i} style={estilos.textoProducto}>
                {prod.codigo} <span style={{ color: '#444' }}>( {prod.tipo} )</span>
              </p>
            ))}
          </div>
        </div>

        {/* Tarjeta: Productos en bajo stock */}
        <div style={estilos.tarjetaGrande}>
          <h2 style={estilos.tituloTarjeta}>Productos en bajo stock :</h2>
          {bajoStock.map((prod, i) => (
            <p key={i} style={estilos.textoProducto}>
              {prod.codigo} <span style={{ color: '#444' }}>( {prod.tipo} )</span>
              <span style={{ fontWeight: 'bold' }}> ( {prod.cant} )</span>
            </p>
          ))}
        </div>

      </div>

      {/* SECCIÓN DE MÉTRICAS (DERECHA) */}
      <div style={estilos.columnaDerecha}>
        
        {/* Métrica 1 */}
        <div style={estilos.tarjetaMetrica}>
          <div style={estilos.tituloMetrica}>Productos Totales</div>
          <div style={estilos.valorMetrica}>4</div>
        </div>

        {/* Métrica 2 */}
        <div style={estilos.tarjetaMetrica}>
          <div style={estilos.tituloMetrica}>Productos en stock</div>
          <div style={estilos.valorMetrica}>20</div>
        </div>

        {/* Métrica 3 */}
        <div style={estilos.tarjetaMetrica}>
          <div style={estilos.tituloMetrica}>Ordenes de envío</div>
          <div style={estilos.valorMetrica}>3</div>
        </div>

        {/* Métrica 4 */}
        <div style={estilos.tarjetaMetrica}>
          <div style={estilos.tituloMetrica}>Ganancias</div>
          <div style={estilos.valorMetrica}>$150.00</div>
        </div>

      </div>

    </div>
  );
}