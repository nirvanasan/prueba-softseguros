import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};
