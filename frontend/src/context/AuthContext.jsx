import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Validate session on load or token change
  useEffect(() => {
    async function validateSession() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res && res.user) {
            setUser(res.user);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Session validation failed:", error);
          handleLogout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    validateSession();
  }, [token]);

  const handleLogin = async (usernameOrEmail, password) => {
    try {
      const res = await api.login(usernameOrEmail, password);
      if (res && res.token) {
        localStorage.setItem("token", res.token);
        setToken(res.token);
        setUser(res.user);
        return res.user;
      } else {
        throw new Error("Invalid login response.");
      }
    } catch (error) {
      console.error("Login failed in AuthContext:", error);
      throw error;
    }
  };

  const handleSignup = async (username, email, password) => {
    try {
      return await api.signup(username, email, password);
    } catch (error) {
      console.error("Signup failed in AuthContext:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
