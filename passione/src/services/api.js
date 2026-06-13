import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Envía la cookie HttpOnly en cada petición automáticamente
});

// Si el backend responde 401, limpia el estado de usuario en la app
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispara un evento global que AuthContext puede escuchar
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export const obtenerProductos = async (params = {}) => {
  const { data } = await api.get("/productos", { params });
  return data;
};

export const crearProducto = async (producto) => {
  const { data } = await api.post("/productos", producto);
  return data;
};

export const eliminarProducto = async (id) => {
  const { data } = await api.delete(`/productos/${id}`);
  return data;
};

export default api;
