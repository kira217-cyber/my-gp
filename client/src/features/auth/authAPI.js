import { api } from "../../api/axios";

export const userRegister = async ({
  countryCode,
  phone,
  password,
  confirmPassword,
  refCode,
}) => {
  const { data } = await api.post("/api/users/register", {
    countryCode,
    phone,
    password,
    confirmPassword,
    refCode,
  });

  return data;
};

export const userLogin = async ({ countryCode, phone, password }) => {
  const { data } = await api.post("/api/users/login", {
    countryCode,
    phone,
    password,
  });
  return data;
};

export const getMyProfile = async () => {
  const { data } = await api.get("/api/users/profile");
  return data;
};
