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

    // ✅ SINGLE SOURCE OF TRUTH
    slotDateTime: {
      type: Date,
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true
    },

    payment: {
      type: Boolean,
      default: false
    },

    cancelled: {
      type: Boolean,
      default: false
    },

    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// 🚫 Prevent double booking (atomic)
appointmentSchema.index(
  { doctorId: 1, slotDateTime: 1 },
  { unique: true }
);

export default mongoose.model("appointment", appointmentSchema);