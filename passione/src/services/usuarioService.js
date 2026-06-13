import api from "./api.js";

export const obtenerStatsApi = async () => {
  const { data } = await api.get("/usuarios/stats");
  return data.datos;
};

export const obtenerUsuariosApi = async () => {
  const { data } = await api.get("/usuarios");
  return data.datos;
};

export const crearUsuarioApi = async (payload) => {
  const { data } = await api.post("/usuarios", payload);
  return data.datos;
};

export const actualizarUsuarioApi = async (id, payload) => {
  const { data } = await api.put(`/usuarios/${id}`, payload);
  return data.datos;
};

export const eliminarUsuarioApi = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}`);
  return data;
};
