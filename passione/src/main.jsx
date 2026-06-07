import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import { LoginRegister } from "./modulos-jsx/login-register.jsx";
//import './styles/login.css'
//import { SideBar } from './modulos-jsx/sideBar.jsx';
import App from './modulos-jsx/userDashboard.jsx';
import './modulos-jsx/sideBar.jsx';
import './styles/user.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
)
