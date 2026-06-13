import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export const obtenerProductos = async (params = {}) => {
  const { data } = await api.get("/productos", { params });
  return data;
};

export const obtenerProductoPorId = async (id) => {
  const { data } = await api.get(`/productos/${id}`);
  return data;
};

export const crearProducto = async (producto) => {
  const { data } = await api.post("/productos", producto);
  return data;
};

export const actualizarProducto = async (id, datos) => {
  const { data } = await api.put(`/productos/${id}`, datos);
  return data;
};

export const eliminarProducto = async (id) => {
  const { data } = await api.delete(`/productos/${id}`);
  return data;
};

export default api;
