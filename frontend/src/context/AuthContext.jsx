import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "byd_admin_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
  );

  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem(STORAGE_KEY, newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setTokenState(null);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, setToken, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
