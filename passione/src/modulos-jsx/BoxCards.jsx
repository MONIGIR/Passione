import 'react';

import '../styles/BoxCards.css'

const InfoCarta = ({titulo, valor,icon, tipo, onAgregarCarrito}) =>{
    const claseCarta = tipo || 'primary';
    const Agregar = ()=>{
        if (Agregar) {
            Agregar({id, titulo, valor});
        }
    };
return (
        <div className={`infoCarta ${claseCarta}`}>
            <div className="CartaPrincipal">
                <div className="CartaInformacion">
                    <span className="CartaTitulo">{titulo}</span>
                    <span className="CartaValor">{valor}</span>
                </div>
                <div className="CartaIcon">
                    {icon} 
                </div>
            </div>
            <div className="CartaAcciones">
                <button className="btn-agregar-carrito" onClick={Agregar}>
                    Agregar al carrito
                </button>
            </div>
        </div>
    )
    
}

export default  InfoCarta;