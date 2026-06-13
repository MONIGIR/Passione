import '../styles/BarraLateral.css';

const BarraLateral = ({ botones = [], vistaActual = '' }) => {
  return (
    <aside className="BarraLateral">
      <div className="TextoLateral">
        {['P','A','S','S','I','O','N','E'].map((char, i) => (
          <span key={i} className="sidebarChar">{char}</span>
        ))}
      </div>

      <nav className="IconosLateral">
        {botones.map((boton, index) => {
          const textoKey = boton.texto.toLowerCase().replace(/\s/g, '');
          const activo = vistaActual && textoKey.startsWith(vistaActual.toLowerCase());
          return (
            <button
              key={index}
              onClick={boton.accion}
              title={boton.texto}
              className={`sidebar-link ${activo ? 'activo' : ''}`}
            >
              <div className="sidebar-icon-wrapper">
                <img src={boton.imagen} alt={boton.texto} className="sidebar-icon" />
                {boton.count > 0 && (
                  <span className="sidebar-badge">{boton.count}</span>
                )}
              </div>
              <span className="sidebar-tooltip">{boton.texto}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default BarraLateral;
