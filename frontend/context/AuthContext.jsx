"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("smartpark_auth");
    if (!stored) {
      setLoading(false);
      return;
    }
    const parsed = JSON.parse(stored);
    setToken(parsed.token);
    setUser(parsed.user);
    setLoading(false);
  }, []);

  const persist = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("smartpark_auth", JSON.stringify({ token: nextToken, user: nextUser }));
  };

  const register = async (payload) => {
    const data = await apiRequest("/auth/register", { method: "POST", body: payload });
    persist(data.token, data.user);
    return data.user;
  };

  const login = async (payload) => {
    const data = await apiRequest("/auth/login", { method: "POST", body: payload });
    persist(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("smartpark_auth");
    setToken(null);
    setUser(null);
    router.push("/");
  };

  const value = useMemo(
    () => ({ token, user, loading, register, login, logout, setUser }),
    [token, user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
