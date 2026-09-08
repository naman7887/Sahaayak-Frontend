import Modal from "../common/Modal";
import invoiceService from "../../services/invoiceService";
import { Printer, ShieldCheck, Download, CheckCircle2 } from "lucide-react";

export const InvoiceModal = ({ isOpen, onClose, payment }) => {
  if (!payment) return null;

  const invoice = invoiceService.generateInvoiceFromPayment(payment);
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cooperative Digital Receipt & Tax Invoice" maxWidth="max-w-2xl">
      <div className="space-y-6 text-gray-800 printable-invoice" id="invoice-content">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {invoice.cooperativeFederation.name}
              </h2>
            </div>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              {invoice.cooperativeFederation.address}
            </p>
            <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-gray-500 font-mono">
              <span>GSTIN: <strong>{invoice.cooperativeFederation.gstin}</strong></span>
              <span>Reg: <strong>{invoice.cooperativeFederation.regNo}</strong></span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:pl-6 border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Invoice Number</span>
            <div className="font-mono text-sm font-black text-emerald-800">{invoice.invoiceNumber}</div>
            <div className="text-xs text-gray-500 mt-1">
              Date: {new Date(invoice.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
              {invoice.paymentStatus}
            </span>
          </div>
        </div>

        {/* Bill To & Service Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-gray-400 block mb-1">Billed To (Customer):</span>
            <div className="font-bold text-gray-900 text-sm">{invoice.customer.name}</div>
            <div className="text-gray-600 mt-0.5">{invoice.customer.phone}</div>
            <div className="text-gray-600">{invoice.customer.email}</div>
            <div className="text-gray-500 mt-1">{invoice.customer.address}</div>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-gray-400 block mb-1">Cooperative Service Provider:</span>
            {invoice.worker ? (
              <>
                <div className="font-bold text-gray-900 text-sm">{invoice.worker.name}</div>
                <div className="text-gray-600 mt-0.5">Phone: {invoice.worker.phone}</div>
                <div className="text-emerald-700 font-semibold mt-1">Verified Member Artisan</div>
              </>
            ) : (
              <div className="text-gray-500 italic">Cooperative Pooled Dispatch</div>
            )}
            <div className="mt-2 text-gray-500">
              Payment Method: <strong className="uppercase">{invoice.paymentMethod}</strong>
            </div>
            <div className="text-gray-500">
              Txn Reference: <span className="font-mono text-[11px]">{invoice.transactionId}</span>
            </div>
          </div>
        </div>

        {/* Table of Line Items */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100/70 border-b border-gray-200 font-bold text-gray-700">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-medium text-gray-900">{item.description}</td>
                  <td className="p-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="p-3 text-right text-gray-600">₹{item.rate}</td>
                  <td className="p-3 text-right font-semibold text-gray-900">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200 text-xs">
              <tr>
                <td colSpan="3" className="p-3 text-right font-semibold text-gray-600">Subtotal:</td>
                <td className="p-3 text-right font-semibold text-gray-900">₹{invoice.subtotal}</td>
              </tr>
              <tr>
                <td colSpan="3" className="p-2 text-right font-semibold text-gray-600">Total GST (18%):</td>
                <td className="p-2 text-right font-semibold text-gray-900">₹{invoice.tax}</td>
              </tr>
              <tr className="border-t border-gray-300 font-black text-sm">
                <td colSpan="3" className="p-3 text-right text-emerald-900">Total Paid:</td>
                <td className="p-3 text-right text-emerald-900">₹{invoice.totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Guarantee Seal */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-[11px] font-medium border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            This is a computer-generated tax receipt under the National Multi-State Cooperative Gig Services Framework. 100% of service tariff after GST is disbursed directly to the artisan.
          </span>
        </div>

        {/* Modal footer print button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
