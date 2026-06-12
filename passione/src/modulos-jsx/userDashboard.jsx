import { useState } from 'react';
import '../styles/user.css';
import Carrito from './carrito'; // Importación original
import BarraLateral from './barraLateral'; 
import IconoUsuario from '../assets/user.svg';
import IconoCarrito from '../assets/shopping-cart.svg';
import IconoCerrar from '../assets/power.svg';

export const WatchCard = ({ product, onAgregar, ocultarBoton }) => (
    <div className="CartaProducto">
        <div className="ContenedorImagen">
            <img src={product.imageUrl} alt={product.title} className="Imagen-producto" />
        </div>
        <div className="ContenedorTexto">
            <h3 className="titulo">{product.title}</h3>
            <p className="Modelo">{product.model}</p>
            <p className="Precio">{product.price}</p>
        </div>
        {!ocultarBoton && (
            <div className="ContenedorAcciones">
                <button className="btn-agregar" onClick={() => onAgregar(product)}>
                    Agregar al carrito
                </button>
            </div>
        )}
    </div>
);

const App = ({ onLogout }) => {
    const [carrito, setCarrito] = useState([]);
    const [mostrarCarrito, setMostrarCarrito] = useState(false);

    const watchData = Array(8).fill({
        imageUrl: "https://via.placeholder.com/150", 
        title: "Rolex",
        model: "Submarine Date",
        price: "A partir de 180,220 MX$"
    }).map((item, index) => ({
        ...item,
        id: `rolex-${index}`
    }));

    const handleAgregarAlCarrito = (producto) => {
        setCarrito((carritoActual) => {
            const existe = carritoActual.find(item => item.id === producto.id);
            if (existe) {
                return carritoActual.map(item =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...carritoActual, { ...producto, cantidad: 1 }];
        });
    };

    const handleEliminarDelCarrito = (id) => {
        setCarrito((carritoActual) => carritoActual.filter(item => item.id !== id));
    };

    const handleLimpiarCarrito = () => {
        setCarrito([]);
    };

    const totalArticulos = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);

    const Botones = [
        {
            imagen: IconoUsuario,
            texto: "Usuario",
            accion: () => alert("Información de perfil del cliente")
        },
        {
            imagen: IconoCarrito,
            texto: `Carrito (${totalArticulos})`,
            accion: () => setMostrarCarrito(!mostrarCarrito),
            count: totalArticulos
        },
        {
            imagen: IconoCerrar,
            texto: "Cerrar sesión",
            accion: onLogout // Ejecuta la desautenticación global
        },
    ];

    return (
        <div className="ContenedorPrincipal">
            <BarraLateral botones={Botones} /> 
            
            <main className="mainGrid">
                {watchData.map((product) => (
                    <WatchCard 
                        key={product.id} 
                        product={product} 
                        onAgregar={handleAgregarAlCarrito} 
                    />
                ))}
            </main>

            {mostrarCarrito && (
                <>
                    <div className="PopupOverlay" onClick={() => setMostrarCarrito(false)} />
                    <div className="PopUpCarrito">
                        <button 
                            className="CerrarPopUpCarrito" 
                            onClick={() => setMostrarCarrito(false)}
                            aria-label="Cerrar carrito"
                        >
                            ×
                        </button>
                        <Carrito
                            items={carrito}
                            onEliminar={handleEliminarDelCarrito}
                            onLimpiarCarrito={handleLimpiarCarrito}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default App