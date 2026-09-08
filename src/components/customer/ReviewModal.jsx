import { useState } from "react";
import Modal from "../common/Modal";
import RatingStars from "../common/RatingStars";
import reviewService from "../../services/reviewService";
import { useToast } from "../../context/ToastContext";
import { Star, Loader2 } from "lucide-react";

export const ReviewModal = ({ isOpen, onClose, booking, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewService.createReview({
        booking: booking._id,
        rating: Number(rating),
        comment,
      });
      showSuccess("Thank you! Your review has been published.");
      if (onReviewSubmitted) onReviewSubmitted(booking._id);
      onClose();
    } catch (err) {
      showError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Cooperative Service" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
        <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
          <div className="font-bold text-gray-900">{booking.service?.name}</div>
          <div className="text-gray-500">
            Worker: <strong>{booking.worker?.name || "Assigned Worker"}</strong>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex items-center gap-3">
            <RatingStars
              rating={rating}
              interactive={true}
              size="md"
              onChange={(r) => setRating(r)}
            />
            <span className="text-sm font-bold text-gray-900">{rating} of 5 Stars</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Review Comments (Optional)
          </label>
          <textarea
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share feedback on punctuality, craftsmanship, and professionalism..."
            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 rounded-xl shadow-sm transition flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Submit Review</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
