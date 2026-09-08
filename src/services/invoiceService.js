// Invoice synthesizing service
// Generates official, verifiable Cooperative Gig Service invoices from Booking & Payment records

export const invoiceService = {
  formatInvoiceNumber: (paymentId, date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const suffix = (paymentId || "00000").slice(-5).toUpperCase();
    return `INV-SHK-${y}${m}-${suffix}`;
  },

  generateInvoiceFromPayment: (payment) => {
    if (!payment) return null;

    const booking = payment.booking || {};
    const service = booking.service || {};
    const customer = payment.customer || booking.customer || {};
    const price = payment.amount || booking.price || 0;

    // Standard service breakdown (cooperative gig pricing)
    const basePrice = Math.round((price / 1.18) * 100) / 100;
    const gstTotal = Math.round((price - basePrice) * 100) / 100;
    const cgst = Math.round((gstTotal / 2) * 100) / 100;
    const sgst = Math.round((gstTotal / 2) * 100) / 100;

    const invoiceDate = payment.paidAt || payment.createdAt || new Date().toISOString();

    return {
      invoiceNumber: invoiceService.formatInvoiceNumber(payment._id, new Date(invoiceDate)),
      date: invoiceDate,
      paymentId: payment._id,
      transactionId: payment.transactionId || "N/A",
      paymentMethod: (payment.paymentMethod || "online").toUpperCase(),
      paymentStatus: payment.paymentStatus || "pending",
      customer: {
        name: customer.name || "Customer",
        phone: customer.phone || "N/A",
        email: customer.email || "N/A",
        address: booking.address || "N/A",
      },
      worker: booking.worker ? {
        name: booking.worker.name || "Cooperative Worker",
        phone: booking.worker.phone || "N/A",
      } : null,
      service: {
        name: service.name || "Household / Community Service",
        category: service.category || "General",
        description: service.description || "",
      },
      lineItems: [
        {
          description: `${service.name || "Service"} (${service.category || "General"})`,
          rate: basePrice,
          quantity: 1,
          amount: basePrice,
        },
        {
          description: "CGST (Central GST @ 9%)",
          rate: 9,
          quantity: 1,
          amount: cgst,
        },
        {
          description: "SGST (State GST @ 9%)",
          rate: 9,
          quantity: 1,
          amount: sgst,
        },
      ],
      subtotal: basePrice,
      tax: gstTotal,
      totalAmount: price,
      cooperativeFederation: {
        name: "National Federation of Cooperative Gig Workers (Sahaayak)",
        pan: "AAACS8926K",
        gstin: "07AAACS8926K1Z9",
        regNo: "MSCS/CR/2026/089",
        address: "Cooperative Bhawan, Institutional Area, New Delhi - 110001",
      },
    };
  },
};

export default invoiceService;
