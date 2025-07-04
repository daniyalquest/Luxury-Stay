import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceByBooking
} from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/booking/:bookingId', getInvoiceByBooking);

export default router;
