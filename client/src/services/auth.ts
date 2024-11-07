import api from "../config/api";

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || error?.message || "Registration failed"
    );
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || error?.message || "Login failed"
    );
  }
};
