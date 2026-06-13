import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import AdminDash from "./modulos-jsx/AdminDashboard.jsx";
import App from "./modulos-jsx/userDashboard.jsx";
import LoginRegister from "./modulos-jsx/login-register.jsx";
import { getMeApi, logoutApi } from "./services/authService.js";

const RootApp = () => {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

  // Al montar la app, intenta recuperar la sesión desde la cookie
  useEffect(() => {
    getMeApi()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setVerificando(false));
  }, []);

  // Si el backend responde 401 desde cualquier parte de la app, cierra sesión
  useEffect(() => {
    const handler = () => handleLogout();
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, []);

  const handleLogin = (datosUsuario) => setUsuario(datosUsuario);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      setUsuario(null);
    }
  };

  if (verificando) {
    return <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>Cargando...</div>;
  }

  if (!usuario) return <LoginRegister onLogin={handleLogin} />;
  if (usuario.role === "admin") return <AdminDash onLogout={handleLogout} />;
  return <App onLogout={handleLogout} />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
