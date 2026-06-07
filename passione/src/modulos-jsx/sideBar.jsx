import "react";
import '../styles/user.css'

const sideBar = () => {
<aside className="BarraLateral">
        <div className="TextoLateral">
        {['P', 'A', 'S', 'S', 'I', 'O', 'N', 'E'].map(char => (
            <span key={char} className="sidebarChar">{char}</span>
        ))}
        </div>
        <nav className="IconosLateral">
        <a href="#"><img src="../assets/shopping_cart.svg" alt="Carrito de compras" /></a>
        <a href="#"><img src="../assets/user.svg" alt="Perfil de usuario" /></a>
        <a href="#"><img src="../assets/power.svg" alt="Cerrar sesión" /></a>
        </nav>
    </aside>
}
export default sideBar;