import api from "./api";

export const serviceService = {
  getAllServices: async (category = "") => {
    const url = category ? `/services?category=${encodeURIComponent(category)}` : "/services";
    return await api.get(url);
  },

  getServiceById: async (id) => {
    return await api.get(`/services/${id}`);
  },

  createService: async (serviceData) => {
    return await api.post("/services", serviceData);
  },

  updateService: async (id, serviceData) => {
    return await api.put(`/services/${id}`, serviceData);
  },

  deleteService: async (id) => {
    return await api.delete(`/services/${id}`);
  },
};

export default serviceService;
