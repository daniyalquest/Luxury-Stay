import { Schema, model } from 'mongoose';

const housekeepingSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['Daily Cleaning', 'Checkout Cleaning', 'Deep Cleaning', 'Maintenance Cleaning'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed', 'Inspection Required', 'Failed'], 
    default: 'Pending' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  scheduledDate: { type: Date, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  checklist: [{
    item: { type: String, required: true },
    completed: { type: Boolean, default: false },
    notes: { type: String }
  }],
  notes: { type: String },
  issuesFound: [{ type: String }],
  supplies: [{
    item: { type: String },
    quantity: { type: Number },
    used: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export default model('Housekeeping', housekeepingSchema);
