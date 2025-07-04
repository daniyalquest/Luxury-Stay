import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['booking', 'maintenance', 'housekeeping', 'system', 'alert', 'reminder'], 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Unread', 'Read', 'Archived'], 
    default: 'Unread' 
  },
  relatedEntity: {
    entityType: { type: String }, // 'booking', 'room', 'maintenance', etc.
    entityId: { type: Schema.Types.ObjectId }
  },
  actionRequired: { type: Boolean, default: false },
  actionUrl: { type: String },
  readAt: { type: Date },
  expiresAt: { type: Date }
}, { timestamps: true });

// Index for efficient queries
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('Notification', notificationSchema);
