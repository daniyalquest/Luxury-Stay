import { Schema, model } from 'mongoose';

const maintenanceSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['Plumbing', 'Electrical', 'HVAC', 'Furniture', 'Cleaning', 'Other'], 
    required: true 
  },
  description: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  estimatedCost: { type: Number, default: 0 },
  actualCost: { type: Number, default: 0 },
  scheduledDate: { type: Date },
  completedDate: { type: Date },
  notes: { type: String },
  images: [{ type: String }] // URLs to uploaded images
}, { timestamps: true });

export default model('Maintenance', maintenanceSchema);
