import axiosInstance from "./axiosInstance";

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/auth/login", userData);
  return response.data;
};
