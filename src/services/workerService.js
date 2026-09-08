import api from "./api";

export const workerService = {
  // Worker actions
  createProfile: async (workerData) => {
    return await api.post("/workers/profile", workerData);
  },

  getMyProfile: async () => {
    return await api.get("/workers/profile");
  },

  updateProfile: async (workerData) => {
    return await api.put("/workers/profile", workerData);
  },

  updateAvailability: async (availability) => {
    return await api.patch("/workers/availability", { availability });
  },

  // Admin actions
  getWorkersByStatus: async (status = "pending") => {
    return await api.get(`/admin/workers?status=${status}`);
  },

  updateVerificationStatus: async (workerId, verificationStatus) => {
    return await api.patch(`/admin/workers/${workerId}/verification`, {
      verificationStatus,
    });
  },
};

export default workerService;
