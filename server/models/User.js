import { Schema, model } from 'mongoose';
import { hash } from 'bcrypt';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'manager', 'receptionist', 'housekeeping', 'guest'], default: 'guest' },
  password: { type: String, required: true },
  phone: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'Pakistan' }
  },
  preferences: {
    roomType: { type: String },
    bedType: { type: String },
    smokingPreference: { type: String, enum: ['Non-smoking', 'Smoking'], default: 'Non-smoking' },
    floorPreference: { type: String },
    specialRequests: { type: String }
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  profilePicture: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  documents: [{
    type: { type: String }, // 'ID', 'Passport', 'License'
    number: { type: String },
    expiryDate: { type: Date }
  }],
  loyaltyPoints: { type: Number, default: 0 },
  permissions: [{
    module: { type: String },
    actions: [{ type: String }]
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, 10);
  next();
});

// Index for efficient queries
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

export default model('User', userSchema);
