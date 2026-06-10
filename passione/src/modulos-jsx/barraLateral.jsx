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
                    <a key={index} href={boton.enlace || "#"} title={boton.texto} className="sidebar-link">
                        <img 
                            src={boton.imagen} 
                            alt={boton.texto} 
                            className="sidebar-icon" 
                        />
                    </a>
                ))}
            </nav>
        </aside>
    );
};

export default BarraLateral;
