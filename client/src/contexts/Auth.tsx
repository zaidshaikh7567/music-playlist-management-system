import { useNavigate } from "react-router-dom";
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../services/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);

      localStorage.setItem("token", response.token);

      setIsAuthenticated(true);

      navigate("/dashboard");
    } catch (error: any) {
      throw new Error(error?.message || "Login failed");
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      await registerUser(username, email, password);

      navigate("/login");
    } catch (error: any) {
      throw new Error(error?.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    setIsAuthenticated(false);

    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ loading, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
