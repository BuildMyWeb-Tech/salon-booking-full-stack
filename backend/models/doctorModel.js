import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
specialty: {
    type: [String], // Now supports an array of strings
    required: true
  },    certification: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },

    available: { type: Boolean, default: true },

    price: { type: Number, required: false },
    phone: { 
        type: String, 
        required: false,
        default: '' 
    },

    instagram: { type: String, default: "" },
    workingHours: { type: String, default: "10AM-7PM" },

    /**
     * {
     *   "2026-01-24": [
     *     "2026-01-24T04:00:00.000Z"
     *   ]
     * }
     */
    slots_booked: {
      type: Map,
      of: [String],
      default: {}
    },

    date: { type: Number, required: true }
  },
  { minimize: false }
);

export default mongoose.model("doctor", doctorSchema);
