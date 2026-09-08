import api from "./api";

export const bookingService = {
  // Customer create booking with geo coordinates
  createBooking: async (bookingData) => {
    return await api.post("/bookings", bookingData);
  },

  // Customer bookings
  getMyBookings: async () => {
    return await api.get("/bookings/my");
  },

  // Worker bookings
  getWorkerBookings: async () => {
    return await api.get("/bookings/worker");
  },

  // Booking details
  getBookingById: async (id) => {
    return await api.get(`/bookings/${id}`);
  },

  // Worker actions
  acceptBooking: async (id) => {
    return await api.patch(`/bookings/${id}/accept`);
  },

  rejectBooking: async (id) => {
    return await api.patch(`/bookings/${id}/reject`);
  },

  // Update status (e.g. in-progress, completed)
  updateBookingStatus: async (id, status) => {
    return await api.patch(`/bookings/${id}/status`, { status });
  },

  // Customer cancellation
  cancelBooking: async (id) => {
    return await api.patch(`/bookings/${id}/cancel`);
  },
};

export default bookingService;
