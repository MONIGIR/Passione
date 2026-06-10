import 'react';

import '../styles/BoxCards.css'

const InfoCarta = ({titulo, valor,icon, tipo}) =>{
    const claseCarta = tipo || 'primary';

    return(
        <div className={`infoCarta ${claseCarta}`}>
            <div className="CartaPrincipal">
                <div className="CartaInformacion">
                    <span className="CartaTitulo">{titulo}</span>
                    <span className="CartaValor">{valor}</span>
                </div>
                <div className="CartaIcon"></div>
                {icon}
            </div>
        </div>
    )

}

export default  InfoCarta;