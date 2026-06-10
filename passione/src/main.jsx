import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import { LoginRegister } from "./modulos-jsx/login-register.jsx";
//import './styles/login.css'
import './modulos-jsx/barraLateral.jsx';
import App from './modulos-jsx/userDashboard.jsx';
import DashboardInventario from './modulos-jsx/AdminDashBoard.jsx';

import './styles/user.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <DashboardInventario />
    </StrictMode>
)
