import { Schema, model } from 'mongoose';

const feedbackSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  category: {
    type: String,
    enum: ['service', 'room', 'food', 'staff', 'facility', 'other'],
    required: true
  },
  suggestions: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'responded', 'resolved'],
    default: 'pending'
  },
  response: { type: String },
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  respondedAt: { type: Date }
}, { timestamps: true });

export default model('Feedback', feedbackSchema);
