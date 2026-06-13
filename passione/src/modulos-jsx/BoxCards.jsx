import { useEffect, useState } from 'react';
import '../styles/BoxCards.css';

// Cuenta progresivamente desde 0 hasta `target`
const useCountUp = (target) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (typeof target !== 'number' || target === 0) { setVal(target); return; }
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(current);
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return val;
};

const InfoCarta = ({ title, value, icon, type = 'primary' }) => {
  const displayValue = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <div className={`infoCarta ${type}`}>
      <div className="CartaPrincipal">
        <div className="CartaInformacion">
          <span className="CartaTitulo">{title}</span>
          <span className="CartaValor">
            {typeof value === 'number' ? displayValue.toLocaleString() : value}
          </span>
        </div>
        <div className="CartaIconBox">{icon}</div>
      </div>
    </div>
  );
};

export default InfoCarta;
