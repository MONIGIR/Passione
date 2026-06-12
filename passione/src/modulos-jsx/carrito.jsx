import 'react';
import '../styles/Carrito.css'; 

const Carrito = ({ items, onEliminar, onLimpiarCarrito }) => {
    
    const handleCompra = () => {
        if (items.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }
        // Aquí procesarías el pago en un entorno real
        alert("¡Compra procesada con éxito! Gracias por tu preferencia.");
        onLimpiarCarrito(); // Vacía el carrito tras la compra
    };

    return (
        <div className="ContenedorCarrito">
            <h2>Tu Carrito de Compras</h2>
            
            {items.length === 0 ? (
                <p className="CarritoVacio">No hay productos en el carrito.</p>
            ) : (
                <>
                    <div className="ListaProductosCarrito">
                        {items.map((item) => (
                            <div key={item.id} className="ItemCarrito">
                                <img src={item.imageUrl} alt={item.title} className="ImagenMini" />
                                <div className="InfoItem">
                                    <h4>{item.title}</h4>
                                    <p>{item.model}</p>
                                    <p className="PrecioItem">{item.price} x {item.cantidad}</p>
                                </div>
                                {/* BOTÓN 1: Eliminar el producto */}
                                <button 
                                    className="btn-eliminar" 
                                    onClick={() => onEliminar(item.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* BOTÓN 2: Comprar productos */}
                    <div className="AccionesCarrito">
                        <button className="btn-comprar" onClick={handleCompra}>
                            Proceder a la Compra
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Carrito;