import 'react';
import '../styles/user.css'
import SideBar from './sideBar';

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
    imageUrl: "", // Aquí puedes colocar una URL de imagen de reloj o usar un placeholder
    title: "Rolex",
    model: "Submarine Date",
    price: "A partir de 180,220 MX$"
});

return (
    <div className="ContenedorPrincipal">
    <SideBar />
    <main className="mainGrid">
        {watchData.map((product, index) => (
        <WatchCard key={index} product={product} />
        ))}
    </main>
    </div>
);
};

export default App;