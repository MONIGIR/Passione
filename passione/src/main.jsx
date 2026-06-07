import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LoginRegister } from "./modulos-jsx/login-register.jsx";
import './styles/login.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoginRegister />
  </StrictMode>,
)
