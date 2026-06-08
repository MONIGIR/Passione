import "react";
import '../styles/BarraLateral.css';
//                     Lista de botones
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
                    <a key={index} href={boton.enlace || "#"} title={boton.texto}>
                        <img src={boton.imagen} alt={boton.texto} />
                    </a>
                ))}
            </nav>
        </aside>
    );
}

export default BarraLateral;
