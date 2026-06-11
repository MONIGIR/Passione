import React, { useState } from 'react'; // Importamos useState para manejar el carrito
import '../styles/user.css';
import BarraLateral from './barraLateral'; 

import IconoUsuario from '../assets/user.svg';
import IconoCarrito from '../assets/shopping-cart.svg';
import IconoCerrar from '../assets/power.svg';

// 1. Modificamos WatchCard para recibir la función onAgregar
const WatchCard = ({ product, onAgregar }) => (
    <div className="CartaProducto">
        <div className="ContenedorImagen">
            <img src={product.imageUrl} alt={product.title} className="Imagen-producto" />
        </div>
        <div className="ContenedorTexto">
            <h3 className="titulo">{product.title}</h3>
            <p className="Modelo">{product.model}</p>
            <p className="Precio">{product.price}</p>
        </div>
        {/* Nuevo contenedor y botón para añadir al carrito */}
        <div className="ContenedorAcciones">
            <button 
                className="btn-agregar" 
                onClick={() => onAgregar(product)}
            >
                Agregar al carrito
            </button>
        </div>
    </div>
);

const App = () => {
    // 2. Creamos el estado para almacenar los productos del carrito
    const [carrito, setCarrito] = useState([]);

    // 3. Modificamos el array para que cada reloj tenga un ID único basado en su posición
    const watchData = Array(8).fill({
        imageUrl: "https://via.placeholder.com/150", 
        title: "Rolex",
        model: "Submarine Date",
        price: "A partir de 180,220 MX$"
    }).map((item, index) => ({
        ...item,
        id: `rolex-${index}` // Genera id: rolex-0, rolex-1, etc.
    }));

    // 4. Función que maneja la lógica de agregar al carrito
    const handleAgregarAlCarrito = (producto) => {
        setCarrito((carritoActual) => {
            // Opcional: Verificar si ya existe en el carrito para aumentar cantidad
            const existe = carritoActual.find(item => item.id === producto.id);
            if (existe) {
                return carritoActual.map(item => 
                    item.id === producto.id ? { ...item, cantidad: (item.cantidad || 1) + 1 } : item
                );
            }
            // Si es nuevo, lo agregamos con cantidad inicial de 1
            return [...carritoActual, { ...producto, cantidad: 1 }];
        });

        // Consola temporal para que verifiques que funciona
        console.log(`Producto añadido: ${producto.title} (${producto.id})`);
    };

    const Botones = [
        {
            imagen: IconoUsuario,
            texto: "Usuario",
            enlace: "#"
        },
        {
            imagen: IconoCarrito,
            // 5. Mostramos la cantidad de artículos totales dinámicamente en el menú si lo deseas
            texto: `Carrito (${carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0)})`,
            enlace: "#"
        },
        {
            imagen: IconoCerrar,
            texto: "Cerrar sesión",
            enlace: "#"
        },
    ];

    return (
        <div className="ContenedorPrincipal">
            <BarraLateral botones={Botones} /> 
            
            <main className="mainGrid">
                {watchData.map((product) => (
                    <WatchCard 
                        key={product.id} // Usamos el nuevo ID único como Key
                        product={product} 
                        onAgregar={handleAgregarAlCarrito} // Pasamos la función a la tarjeta
                    />
                ))}
            </main>
        </div>
    );
};

export default App;