import api from "./api";

export const paymentService = {
  // Customer initiates payment
  createPayment: async (paymentData) => {
    return await api.post("/payments", paymentData);
  },

  // Customer retrieves their payment history
  getMyPayments: async () => {
    return await api.get("/payments/my");
  },

  // Retrieve single payment details
  getPaymentById: async (id) => {
    return await api.get(`/payments/${id}`);
  },

  // Admin updates payment status
  updatePaymentStatus: async (id, statusData) => {
    return await api.patch(`/payments/${id}/status`, statusData);
  },
};

export default paymentService;
