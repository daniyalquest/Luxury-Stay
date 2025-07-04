import { Schema, model } from 'mongoose';

const bookingSchema = new Schema({
  guest: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  actualCheckInDate: { type: Date },
  actualCheckOutDate: { type: Date },
  status: { type: String, enum: ['Reserved', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow'], default: 'Reserved' },
  totalAmount: { type: Number },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid', 'Refunded'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'Bank Transfer', 'Online'], default: 'Cash' },
  numberOfGuests: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },
  specialRequests: { type: String },
  services: [{ type: Schema.Types.ObjectId, ref: 'ServiceRequest' }],
  bookingSource: { type: String, enum: ['Walk-in', 'Phone', 'Online', 'Agent'], default: 'Walk-in' },
  cancellationReason: { type: String },
  checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
  checkedOutBy: { type: Schema.Types.ObjectId, ref: 'User' },
  keyNumber: { type: String },
  notes: { type: String },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for efficient queries
bookingSchema.index({ guest: 1 });
bookingSchema.index({ room: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkInDate: 1 });
bookingSchema.index({ checkOutDate: 1 });

export default model('Booking', bookingSchema);
