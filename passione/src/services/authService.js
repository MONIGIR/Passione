import api from "./api.js";

export const loginApi = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data.datos; // { _id, nombre, email, role }
};

export const registroApi = async (nombre, email, password) => {
  const { data } = await api.post("/auth/registro", { nombre, email, password });
  return data.datos;
};

export const logoutApi = async () => {
  await api.post("/auth/logout");
};

export const getMeApi = async () => {
  const { data } = await api.get("/auth/me");
  return data.datos;
};

export const actualizarPerfilApi = async (payload) => {
  const { data } = await api.put("/auth/perfil", payload);
  return data.datos;
};
