import api from "./api";

export const salaryService = {
  // Worker current month guaranteed base + overtime
  getMyCurrentSalary: async () => {
    return await api.get("/worker-salaries/my");
  },

  // Worker history
  getMySalaryHistory: async () => {
    return await api.get("/worker-salaries/my/history");
  },

  // Admin view all worker salaries
  getAllSalaries: async () => {
    return await api.get("/worker-salaries");
  },

  // Admin recalculate formula: Final = Base + (Extra * OvertimeRate) + Bonus + Adjustment
  recalculateSalary: async (salaryId) => {
    return await api.put(`/worker-salaries/${salaryId}/recalculate`);
  },

  // Admin disburse salary
  markSalaryAsPaid: async (salaryId) => {
    return await api.put(`/worker-salaries/${salaryId}/pay`);
  },
};

export default salaryService;
