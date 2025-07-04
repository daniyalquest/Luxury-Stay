import { Schema, model } from 'mongoose';

const roomSchema = new Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g., "Deluxe", "Suite", "Standard"
  status: { type: String, enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance', 'Out of Order'], default: 'Available' },
  price: { type: Number, required: true },
  description: { type: String },
  floor: { type: Number, required: true },
  capacity: { 
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 1 }
  },
  bedType: { type: String, enum: ['Single', 'Double', 'Queen', 'King', 'Twin'], default: 'Double' },
  amenities: [{
    name: { type: String },
    description: { type: String }
  }],
  features: {
    wifi: { type: Boolean, default: true },
    airConditioning: { type: Boolean, default: true },
    miniBar: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    seaView: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false }
  },
  images: [{ type: String }], // URLs to room images
  lastCleaned: { type: Date },
  lastMaintenance: { type: Date },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for efficient queries
roomSchema.index({ status: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ isActive: 1 });

export default model('Room', roomSchema);
