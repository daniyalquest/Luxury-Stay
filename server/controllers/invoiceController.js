import Invoice from '../models/Invoice.js';

export const createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getInvoices = async (req, res) => {
  const invoices = await Invoice.find().populate('booking');
  res.json(invoices);
};

export const getInvoiceByBooking = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ booking: req.params.bookingId }).populate({
      path: 'booking',
      populate: {
        path: 'room guest',
        select: 'roomNumber type price name email'
      }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
