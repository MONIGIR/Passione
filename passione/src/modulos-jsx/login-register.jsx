import { useState } from "react";
import { loginApi, registroApi } from "../services/authService.js";
import "../styles/login.css";

export const LoginRegister = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      if (isLogin) {
        const usuario = await loginApi(email, password);
        onLogin(usuario);
      } else {
        const usuario = await registroApi(nombre, email, password);
        onLogin(usuario);
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="Container-Autorizacion">
      <div className="Carta-autorizacion">
        <h2>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</h2>
        <p className="autorizar-sub">
          {isLogin ? "Bienvenido de vuelta" : "Regístrate para entrar"}
        </p>

        {error && (
          <p style={{ color: "red", marginBottom: "1rem", fontSize: "0.9rem" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="autorizar-formulario">
          {!isLogin && (
            <div className="formulario">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>
          )}
          <div className="formulario">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div className="formulario">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>
          <button type="submit" className="btn-submit" disabled={cargando}>
            {cargando ? "Cargando..." : isLogin ? "Ingresar" : "Registrarse"}
          </button>
        </form>

        <div className="autorizar-alternar">
          <p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="btn-alternar"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
