import { axiosInstance } from "../lib/axios";

export const checkAuth = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      return null;
    }
  }
};

export const signup = async (data) => {
  const res = await axiosInstance.post("/auth/signup", data);
  return res.data;
};

export const login = async (data) => {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data;
};

export const logout = async () => {
  await axiosInstance.post("/auth/logout");
};

export const updateProfile = async (data) => {
  const res = await axiosInstance.put("/auth/update-profile", data);
  return res.data;
};

export const cancelConnectionRequest = async (requestId) => {
  const res = await axiosInstance.delete(`/connections/cancel/${requestId}`);
  return res.data;
};
