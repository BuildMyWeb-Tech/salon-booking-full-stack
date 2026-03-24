// C:\Users\Siddharathan\Desktop\salon-booking-full-stack\backend\models\doctorModel.js
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },

    specialty: {
      type: [String], // Supports an array of strings
      required: true,
    },

    certification: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },

    available: { type: Boolean, default: true },

    price: { type: Number, required: false },
    phone: {
      type: String,
      required: false,
      default: '',
    },

    instagram: { type: String, default: '' },
    workingHours: { type: String, default: '10AM-7PM' },

    /**
     * Leave dates for the stylist (admin-managed)
     * Format: ["YYYY-MM-DD", "YYYY-MM-DD", ...]
     * Users cannot book appointments on these dates
     */
    leaveDates: {
      type: [String], // Array of "YYYY-MM-DD" strings
      default: [],
    },

    /**
     * {
     *   "2026-01-24": ["10:00", "11:00"]
     * }
     */
    slots_booked: {
      type: Map,
      of: [String],
      default: {},
    },

    date: { type: Number, required: true },
  },
  { minimize: false }
);

export default mongoose.model('doctor', doctorSchema);
