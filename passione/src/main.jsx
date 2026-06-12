import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

// Componentes Principales de Rutas
import AdminDash from './modulos-jsx/AdminDashboard.jsx';
import App from './modulos-jsx/userDashboard.jsx';
import LoginRegister from './modulos-jsx/login-register.jsx';

const RootApp = () => {
    // El estado será null si no hay sesión iniciada, u objeto { email, role } si ya ingresó
    const [usuario, setUsuario] = useState(null);

    const handleLogin = (datosUsuario) => {
        setUsuario(datosUsuario);
    };

    const handleLogout = () => {
        setUsuario(null); // Regresa automáticamente al LoginRegister
    };

    // Renderizado condicional basado en la sesión activa
    if (!usuario) {
        return <LoginRegister onLogin={handleLogin} />;
    }

    if (usuario.role === 'admin') {
        return <AdminDash onLogout={handleLogout} />;
    } else {
        return <App onLogout={handleLogout} />;
    }
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RootApp />
    </StrictMode>
);