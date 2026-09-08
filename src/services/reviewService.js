import api from "./api";

export const reviewService = {
  // Submit a review for a completed booking
  createReview: async (reviewData) => {
    return await api.post("/reviews", reviewData);
  },

  // Get all reviews for a specific worker
  getWorkerReviews: async (workerId) => {
    return await api.get(`/reviews/worker/${workerId}`);
  },
};

export default reviewService;
