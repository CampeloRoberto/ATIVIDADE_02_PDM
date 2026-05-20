import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const VALID_EMAIL = "admin@gmail.com";
const VALID_PASSWORD = "password";
const AUTH_KEY = "@pdm_auth";

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then((val) => {
      setIsAuthenticated(val === "true");
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email, password) => {
    if (
      email.trim().toLowerCase() !== VALID_EMAIL ||
      password !== VALID_PASSWORD
    ) {
      throw new Error("E-mail ou senha incorretos.");
    }
    await AsyncStorage.setItem(AUTH_KEY, "true");
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
