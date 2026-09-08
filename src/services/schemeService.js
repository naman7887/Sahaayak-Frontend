import api from "./api";

export const schemeService = {
  getAllSchemes: async (category = "") => {
    const url = category ? `/schemes?category=${encodeURIComponent(category)}` : "/schemes";
    return await api.get(url);
  },

  getSchemeById: async (id) => {
    return await api.get(`/schemes/${id}`);
  },

  // Smart AI-matching recommendation for logged-in worker
  getRecommendedSchemes: async () => {
    return await api.get("/schemes/recommended");
  },

  createScheme: async (schemeData) => {
    return await api.post("/schemes", schemeData);
  },

  updateScheme: async (id, schemeData) => {
    return await api.put(`/schemes/${id}`, schemeData);
  },

  deleteScheme: async (id) => {
    return await api.delete(`/schemes/${id}`);
  },
};

export default schemeService;
