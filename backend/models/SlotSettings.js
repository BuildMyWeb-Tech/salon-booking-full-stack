// backend/models/SlotSettings.js
import mongoose from 'mongoose';

const slotSettingsSchema = new mongoose.Schema({
  slotStartTime: {
    type: String,
    default: '09:00'
  },
  slotEndTime: {
    type: String,
    default: '17:00'
  },
  slotDuration: {
    type: Number,
    enum: [15, 30, 45, 60],
    default: 30
  },
  breakTime: {
    type: Boolean,
    default: true
  },
  breakStartTime: {
    type: String,
    default: '13:00'
  },
  breakEndTime: {
    type: String,
    default: '14:00'
  },
  daysOpen: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  openSlotsFromDate: {
    type: Date,
    default: Date.now
  },
  openSlotsTillDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }
  },
  allowRescheduling: {
    type: Boolean,
    default: true
  },
  rescheduleHoursBefore: {
    type: Number,
    default: 24
  },
  maxAdvanceBookingDays: {
    type: Number,
    default: 30
  },
  minBookingTimeBeforeSlot: {
    type: Number,
    default: 2
  },
  // ✅ NEW: Advanced payment settings
  advancePaymentRequired: {
    type: Boolean,
    default: true
  },
  advancePaymentPercentage: {
    type: Number,
    enum: [10, 25, 30, 50, 75, 100],
    default: 100
  }
}, {
  timestamps: true
});

const SlotSettings = mongoose.model('SlotSettings', slotSettingsSchema);

export default SlotSettings;