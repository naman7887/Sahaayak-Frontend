import api from "./api";

export const insuranceService = {
  getAllPlans: async () => {
    return await api.get("/insurance");
  },

  getPlanById: async (id) => {
    return await api.get(`/insurance/${id}`);
  },

  createPlan: async (planData) => {
    return await api.post("/insurance", planData);
  },

  updatePlan: async (id, planData) => {
    return await api.put(`/insurance/${id}`, planData);
  },

  deletePlan: async (id) => {
    return await api.delete(`/insurance/${id}`);
  },
};

export default insuranceService;
