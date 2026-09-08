import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem("sahaayak_token") || localStorage.getItem("token") || null;
  });
  const [loading, setLoading] = useState(true);

  // Restore authenticated session
  const restoreUserSession = useCallback(async () => {
    const savedToken = localStorage.getItem("sahaayak_token") || localStorage.getItem("token");
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response && response.user) {
        setUser(response.user);
        setToken(savedToken);
        localStorage.setItem("sahaayak_user", JSON.stringify(response.user));
      } else {
        authService.logout();
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn("Session restore failed, signing out:", err.message);
      authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreUserSession();
  }, [restoreUserSession]);

  // Login
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.token && data.user) {
      localStorage.setItem("sahaayak_token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("sahaayak_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  // Register
  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.token && data.user) {
      localStorage.setItem("sahaayak_token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("sahaayak_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  // Logout
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  // Update user in context
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem("sahaayak_user", JSON.stringify(updated));
      return updated;
    });
  };

  const role = user?.role || null;
  const isAuthenticated = !!user && !!token;
  const isCustomer = role === "customer";
  const isWorker = role === "worker";
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        role,
        isCustomer,
        isWorker,
        isAdmin,
        login,
        register,
        logout,
        restoreUserSession,
        updateUser,
      }}
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

export default AuthContext;
