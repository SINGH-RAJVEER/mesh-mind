import authAPI from "./authAPI";

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  return authAPI.signUp(userData.email, userData.password, userData.username);
};

export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  return authAPI.signIn(userData.email, userData.password);
};
