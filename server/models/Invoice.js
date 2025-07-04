import { Schema, model } from 'mongoose';

const invoiceSchema = new Schema({
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  items: [{
    description: String,
    amount: Number
  }],
  totalAmount: { type: Number, required: true },
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default model('Invoice', invoiceSchema);
