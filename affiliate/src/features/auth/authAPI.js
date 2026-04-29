import { api } from "../../api/axios";

export const affiliateRegister = async (payload) => {
  const { data } = await api.post("/api/affiliate/register", payload);
  return data;
};

export const affiliateLogin = async (payload) => {
  const { data } = await api.post("/api/affiliate/login", payload);
  return data;
};

export const getAffiliateProfile = async () => {
  const { data } = await api.get("/api/affiliate/profile");
  return data;
};
