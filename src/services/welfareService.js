import api from "./api";

export const welfareService = {
  getAllWelfare: async (category = "") => {
    const url = category ? `/welfare?category=${encodeURIComponent(category)}` : "/welfare";
    return await api.get(url);
  },

  getWelfareById: async (id) => {
    return await api.get(`/welfare/${id}`);
  },

  createWelfare: async (welfareData) => {
    return await api.post("/welfare", welfareData);
  },

  updateWelfare: async (id, welfareData) => {
    return await api.put(`/welfare/${id}`, welfareData);
  },

  deleteWelfare: async (id) => {
    return await api.delete(`/welfare/${id}`);
  },
};

export default welfareService;
