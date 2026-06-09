import 'react';
import '../styles/user.css';
import BarraLateral from './barraLateral'; 

import IconoUsuario from '../assets/user.svg';
import IconoCarrito from '../assets/shopping-cart.svg';
import IconoCerrar from '../assets/power.svg';

const WatchCard = ({ product }) => (
    <div className="CartaProducto">
        <div className="ContenedorImagen">
            
            <img src={product.imageUrl} alt={product.title} className="Imagen-producto" />
        </div>
        <div className="ContenedorTexto">
            <h3 className="titulo">{product.title}</h3>
            <p className="Modelo">{product.model}</p>
            <p className="Precio">{product.price}</p>
        </div>
    </div>
);

const App = () => {
    const watchData = Array(8).fill({
        imageUrl: "https://via.placeholder.com/150", 
        title: "Rolex",
        model: "Submarine Date",
        price: "A partir de 180,220 MX$"

    });
    const Botones = [
        {
            imagen:IconoUsuario,
            texto:"Usuario",
            enlace:"#"
        },
                {
            imagen:IconoCarrito,
            texto:"Carrito",
            enlace:"#"
        },
                {
            imagen:IconoCerrar,
            texto:"Cerrar sesión",
            enlace:"#"
        },
    ];
// Renderizado del dashboard
    return (
        <div className="ContenedorPrincipal">
            <BarraLateral botones={Botones} /> 
            
            <main className="mainGrid">
                {watchData.map((product, index) => (
                    <WatchCard key={index} product={product} />
                ))}
            </main>
        </div>
    );
};

export default App;