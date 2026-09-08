import api from "./api";

export const authService = {
  // Register: { name, email, phone, password, role, language }
  register: async (userData) => {
    return await api.post("/auth/register", userData);
  },

  // Login: { email, password }
  login: async (credentials) => {
    return await api.post("/auth/login", credentials);
  },

  // Get current authenticated user
  getMe: async () => {
    return await api.get("/auth/me");
  },

  // Logout helper
  logout: () => {
    localStorage.removeItem("sahaayak_token");
    localStorage.removeItem("token");
    localStorage.removeItem("sahaayak_user");
  },
};

export default authService;
