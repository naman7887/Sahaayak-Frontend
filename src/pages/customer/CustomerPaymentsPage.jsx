import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import paymentService from "../../services/paymentService";
import bookingService from "../../services/bookingService";
import { useToast } from "../../context/ToastContext";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import InvoiceModal from "../../components/customer/InvoiceModal";
import Modal from "../../components/common/Modal";
import {
  CreditCard,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  PlusCircle,
  Loader2,
  QrCode,
  Banknote,
} from "lucide-react";

export const CustomerPaymentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetBookingId = searchParams.get("booking");

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Payment Modal state
  const [isPayModalOpen, setIsPayModalOpen] = useState(!!targetBookingId);
  const [selectedBookingId, setSelectedBookingId] = useState(targetBookingId || "");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);

  // Invoice Modal
  const [selectedInvoicePayment, setSelectedInvoicePayment] = useState(null);

  const { showSuccess, showError } = useToast();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getMyPayments();
      if (res && res.payments) {
        setPayments(res.payments);
      }
    } catch (err) {
      showError(err.message || "Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedBookings = async () => {
    try {
      const res = await bookingService.getMyBookings();
      if (res && res.bookings) {
        // filter bookings that are completed or accepted and not cancelled
        const valid = res.bookings.filter((b) => b.status !== "cancelled");
        setCompletedBookings(valid);
        if (!selectedBookingId && valid.length > 0) {
          setSelectedBookingId(valid[0]._id);
        }
      }
    } catch {
      // quiet
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchCompletedBookings();
  }, []);

  useEffect(() => {
    if (targetBookingId) {
      setSelectedBookingId(targetBookingId);
      setIsPayModalOpen(true);
    }
  }, [targetBookingId]);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      showError("Please select a booking to pay for.");
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await paymentService.createPayment({
        booking: selectedBookingId,
        paymentMethod,
      });

      if (res && res.payment) {
        showSuccess("Payment record generated! Thank you.");
        setIsPayModalOpen(false);
        setSearchParams({});
        fetchPayments();
      }
    } catch (err) {
      showError(err.message || "Payment initiation failed.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Payments & Digital Receipts
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Transparent cooperative billing with official tax receipts and zero hidden charges
          </p>
        </div>
        <button
          onClick={() => setIsPayModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Pay for a Service</span>
        </button>
      </div>

      {/* Payment Table / List */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Fetching your payment history..." />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records found"
          description="You haven't initiated any payments yet. When you complete a service booking, your digital receipts will appear here."
          actionText="Make a Payment"
          onAction={() => setIsPayModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="p-4">Service & Booking</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Receipt / Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">
                        {p.booking?.service?.name || "Household Gig Service"}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        Booking ID: {p.booking?._id?.slice(-8).toUpperCase() || "N/A"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-black text-emerald-800">
                        ₹{p.amount}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 font-bold text-gray-700 uppercase text-[11px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={p.paymentStatus} type="payment" />
                    </td>
                    <td className="p-4 text-gray-500 font-medium">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedInvoicePayment(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 text-xs font-bold transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>View Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Service Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setSearchParams({});
        }}
        title="Pay for Cooperative Service"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Select Booking
            </label>
            {completedBookings.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
                No active bookings available to pay for.
              </p>
            ) : (
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:ring-2 focus:ring-emerald-600"
              >
                {completedBookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.service?.name || "Service"} — ₹{b.price} ({b.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "upi", label: "UPI (GPay/PhonePe)", icon: QrCode },
                { id: "card", label: "Debit / Credit Card", icon: CreditCard },
                { id: "online", label: "Net Banking", icon: ShieldCheck },
                { id: "cash", label: "Cash on Service", icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                      paymentMethod === m.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-xs"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              100% Cooperative Gig Guarantee: Guaranteed artisan wage credited upon confirmation.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsPayModalOpen(false);
                setSearchParams({});
              }}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPayment || completedBookings.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {submittingPayment && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Submit Payment</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoicePayment}
        onClose={() => setSelectedInvoicePayment(null)}
        payment={selectedInvoicePayment}
      />
    </div>
  );
};

export default CustomerPaymentsPage;
