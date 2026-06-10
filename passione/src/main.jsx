import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import { LoginRegister } from "./modulos-jsx/login-register.jsx";
//import './styles/login.css'
import './modulos-jsx/barraLateral.jsx';
import App from './modulos-jsx/userDashboard.jsx';

import './styles/user.css';
import AdminDashboard from './modulos-jsx/AdminDashboard.jsx';
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)
