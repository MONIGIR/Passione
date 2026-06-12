import '../styles/BarraLateral.css';

const BarraLateral = ({ botones = [] }) => {
    return (
        <aside className="BarraLateral">
            <div className="TextoLateral">
                {['P', 'A', 'S', 'S', 'I', 'O', 'N', 'E'].map((char, index) => (
                    <span key={index} className="sidebarChar">{char}</span>
                ))}
            </div>
            <nav className="IconosLateral">
                {botones.map((boton, index) => (
                    <button 
                        key={index} 
                        onClick={boton.accion} 
                        title={boton.texto} 
                        className="sidebar-link"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                        <div className="sidebar-icon-wrapper">
                            <img 
                                src={boton.imagen} 
                                alt={boton.texto} 
                                className="sidebar-icon" 
                            />
                            {boton.count > 0 && (
                                <span className="sidebar-badge">{boton.count}</span>
                            )}
                        </div>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default BarraLateral;
