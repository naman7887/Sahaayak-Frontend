import api from "./api";

export const trainingService = {
  // Public / Authenticated catalog
  getTrainingPrograms: async () => {
    return await api.get("/training");
  },

  getTrainingById: async (id) => {
    return await api.get(`/training/${id}`);
  },

  // Admin catalog management
  createTraining: async (programData) => {
    return await api.post("/training", programData);
  },

  updateTraining: async (id, programData) => {
    return await api.put(`/training/${id}`, programData);
  },

  deleteTraining: async (id) => {
    return await api.delete(`/training/${id}`);
  },

  // Worker enrollments & certificates
  enrollInTraining: async (trainingId) => {
    return await api.post(`/worker-trainings/${trainingId}/enroll`);
  },

  getMyTrainings: async () => {
    return await api.get("/worker-trainings/my");
  },

  getMyTrainingById: async (id) => {
    return await api.get(`/worker-trainings/my/${id}`);
  },

  updateMyTrainingStatus: async (enrollmentId, statusData) => {
    return await api.put(`/worker-trainings/my/${enrollmentId}/status`, statusData);
  },

  cancelMyTraining: async (enrollmentId) => {
    return await api.delete(`/worker-trainings/my/${enrollmentId}`);
  },
};

export default trainingService;
