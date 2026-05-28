import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const TOKEN_KEY = "@pdm_token";
const USER_KEY  = "@pdm_user";

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [token, setToken]               = useState(null);
  const [user, setUser]                 = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]).then(([t, u]) => {
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email: email.trim().toLowerCase(), password });
    await AsyncStorage.multiSet([[TOKEN_KEY, res.token], [USER_KEY, JSON.stringify(res.user)]]);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
    await AsyncStorage.multiSet([[TOKEN_KEY, res.token], [USER_KEY, JSON.stringify(res.user)]]);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
