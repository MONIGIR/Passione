import api from "./api.js";

// Usuario finaliza compra
export const crearOrdenApi = async (items) => {
  const payload = {
    items: items.map(i => ({ productoId: i._id, cantidad: i.cantidad })),
  };
  const { data } = await api.post("/ordenes", payload);
  return data.datos;
};

// Admin obtiene todas las órdenes
export const obtenerOrdenesApi = async () => {
  const { data } = await api.get("/ordenes");
  return data.datos;
};

// Admin actualiza estado de una orden
export const actualizarOrdenApi = async (id, estado) => {
  const { data } = await api.put(`/ordenes/${id}`, { estado });
  return data.datos;
};
