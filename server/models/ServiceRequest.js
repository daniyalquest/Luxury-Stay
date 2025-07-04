import { Schema, model } from 'mongoose';

const serviceRequestSchema = new Schema({
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  guest: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Room Service', 'Laundry', 'Wake-up Call', 'Transportation', 'Extra Towels', 'Extra Pillows', 'Housekeeping', 'Maintenance', 'Other']
  },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  requestedTime: { type: Date },
  scheduledTime: { type: Date },
  completedTime: { type: Date },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  cost: { type: Number, default: 0 },
  notes: { type: String },
  guestNotes: { type: String },
  staffNotes: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String }
}, { timestamps: true });

// Indexes for efficient queries
serviceRequestSchema.index({ booking: 1 });
serviceRequestSchema.index({ guest: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ assignedTo: 1 });

export default model('ServiceRequest', serviceRequestSchema);
