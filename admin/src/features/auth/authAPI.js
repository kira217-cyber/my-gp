import { api } from "../../api/axios";


export const adminLogin = async ({ email, password }) => {
  const { data } = await api.post("/api/admin/login", { email, password });
  return data;
};