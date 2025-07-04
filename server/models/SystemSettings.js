import { Schema, model } from 'mongoose';

const systemSettingsSchema = new Schema({
  category: { 
    type: String, 
    enum: ['General', 'Billing', 'Notifications', 'Security', 'Policies'], 
    required: true 
  },
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  description: { type: String },
  dataType: { 
    type: String, 
    enum: ['string', 'number', 'boolean', 'object', 'array'], 
    default: 'string' 
  },
  isActive: { type: Boolean, default: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Create compound index for category and key
systemSettingsSchema.index({ category: 1, key: 1 });

export default model('SystemSettings', systemSettingsSchema);
