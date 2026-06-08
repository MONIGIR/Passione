import 'react';
import '../styles/user.css';
import BarraLateral from './barraLateral'; 

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
            imagen:'../assets/user.svg',
            texto:"Usuario",
            enlace:"#"
        },
                {
            imagen:'../assets/shopping-cart.svg',
            texto:"Carrito",
            enlace:"#"
        },
                {
            imagen:'../assets/power.svg',
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