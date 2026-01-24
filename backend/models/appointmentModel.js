import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true
    },

    // YYYY-MM-DD (for UI grouping)
    slotDate: {
      type: String,
      required: true
    },

    // "09:30 AM" (display only)
    slotTime: {
      type: String,
      required: true
    },

    // ✅ SINGLE SOURCE OF TRUTH for date/time
    slotDateTime: {
      type: Date,
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true
    },

    // Backward compatibility - combined service names
    service: {
      type: String,
      default: "Hair Styling"
    },

    // ✅ NEW: Array of services with individual prices
    services: [{
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }],

    payment: {
      type: Boolean,
      default: false
    },

    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'cash', null],
      default: null
    },

    cancelled: {
      type: Boolean,
      default: false
    },

    // Track who cancelled the appointment
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', null],
      default: null
    },

    isCompleted: {
      type: Boolean,
      default: false
    },

    rescheduled: {
      type: Boolean,
      default: false
    },

    // Store user data for quick access
    userData: {
      name: String,
      phone: String,
      image: String
    },

    // Store doctor/stylist data for quick access
    docData: {
      name: String,
      image: String,
      speciality: String
    }
  },
  { timestamps: true }
);

// 🚫 Prevent double booking (atomic)
appointmentSchema.index(
  { doctorId: 1, slotDateTime: 1 },
  { unique: true }
);

// Index for efficient querying
appointmentSchema.index({ userId: 1, isCompleted: 1 });
appointmentSchema.index({ doctorId: 1, isCompleted: 1 });
appointmentSchema.index({ slotDateTime: 1 });

export default mongoose.model("appointment", appointmentSchema);