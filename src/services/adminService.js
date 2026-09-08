import api from "./api";

export const adminService = {
  getDashboardStats: async () => {
    return await api.get("/admin/dashboard");
  },

  getWorkers: async (status = "pending") => {
    return await api.get(`/admin/workers?status=${status}`);
  },

  updateWorkerVerification: async (workerId, verificationStatus) => {
    return await api.patch(`/admin/workers/${workerId}/verification`, {
      verificationStatus,
    });
  },
};

export default adminService;
