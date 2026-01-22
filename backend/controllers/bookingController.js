// controllers/bookingController.js
import doctorModel from '../models/doctorModel.js';
import userModel from '../models/userModel.js';
import appointmentModel from '../models/appointmentModel.js';
import SlotSettings from '../models/SlotSettings.js';
import { generateAvailableSlots, isSlotAvailable } from '../utils/slotUtils.js';

/**
 * Get available slots for a specific date and doctor
 */
export const getAvailableSlots = async (req, res) => {
  try {
    const { date, docId } = req.query;

    console.log("RAW DATE FROM FRONTEND:", date);

    // ❌ Validate date
    if (!date || isNaN(new Date(date).getTime())) {
      return res.json({ success: false, message: "Invalid date" });
    }

    // 🔍 Validate doctor availability
    let doctor = null;
    if (docId) {
      doctor = await doctorModel.findById(docId);
      if (!doctor || !doctor.available) {
        return res.json({ success: false, message: "Stylist unavailable" });
      }
    }

    // ⏱ Generate slots (backend source of truth)
    const { slots, error } = await generateAvailableSlots(date);
    if (error) {
      return res.json({ success: false, message: error });
    }

    // 🟢 Filter booked slots for this doctor
    if (doctor) {
      const slotKey = date; // YYYY-MM-DD

      let bookedSlots = [];

      // ✅ FIX: Map-safe access
      if (doctor.slots_booked instanceof Map) {
        bookedSlots = doctor.slots_booked.get(slotKey) || [];
      } else {
        bookedSlots = doctor.slots_booked?.[slotKey] || [];
      }

      const availableSlots = slots.filter(
        slot => !bookedSlots.includes(slot.startTime)
      );

      return res.json({
        success: true,
        slots: availableSlots
      });
    }

    // 🟢 If no doctor filter
    return res.json({
      success: true,
      slots
    });

  } catch (error) {
    console.error("Error fetching slots:", error);
    return res.json({ success: false, message: "Server error" });
  }
};


/**
 * Book an appointment (ISO SLOT BASED – OPTION A)
 */
export const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    // ❌ Basic validation
    if (!userId || !docId || !slotDate || !slotTime) {
      return res.json({ success: false, message: "Missing booking data" });
    }

    /**
     * slotTime MUST be ISO from frontend
     * Example: "2026-01-24T04:00:00.000Z"
     */
    const slotDateTime = new Date(slotTime);

    if (isNaN(slotDateTime.getTime())) {
      return res.json({ success: false, message: "Invalid slot time" });
    }

    console.log("BOOK SLOT:", slotDate, slotDateTime.toISOString());
    console.log("USER ID:", userId);
    console.log("DOCTOR ID:", docId);

    // 🔍 Fetch doctor
    const doctor = await doctorModel.findById(docId);
    if (!doctor || !doctor.available) {
      return res.json({ success: false, message: "Stylist unavailable" });
    }

    // ✅ Backend slot validation (single source of truth)
    const isAvailable = await isSlotAvailable(slotDate, slotDateTime.toISOString());
    if (!isAvailable) {
      return res.json({ success: false, message: "Slot no longer available" });
    }

    /**
     * 🚫 Prevent double booking (doctor-side)
     */
    const slotKey = slotDate; // YYYY-MM-DD

    if (!doctor.slots_booked) doctor.slots_booked = new Map();
    if (!doctor.slots_booked.get(slotKey)) {
      doctor.slots_booked.set(slotKey, []);
    }

    const bookedSlots = doctor.slots_booked.get(slotKey);

    if (bookedSlots.includes(slotDateTime.toISOString())) {
      return res.json({ success: false, message: "Slot already booked" });
    }

    // ✅ Lock slot
    bookedSlots.push(slotDateTime.toISOString());
    doctor.slots_booked.set(slotKey, bookedSlots);
    await doctor.save();

    /**
     * ✅ Create appointment (schema-aligned)
     */
    const appointment = new appointmentModel({
      userId,
      doctorId: docId,
      slotDate,
      slotTime: slotDateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }),
      slotDateTime,
      amount: doctor.price,
      payment: true
    });

    await appointment.save();

    return res.json({
      success: true,
      message: "Appointment booked successfully",
      appointmentId: appointment._id
    });

  } catch (error) {
    console.error("Booking error:", error);

    // 🛑 Duplicate booking protection (Mongo index)
    if (error.code === 11000) {
      return res.json({
        success: false,
        message: "Slot already booked"
      });
    }

    res.json({ success: false, message: "Booking failed" });
  }
};


/**
 * Reschedule an existing appointment
 */
export const rescheduleAppointment = async (req, res) => {
  try {
    const { userId, appointmentId, slotDate, slotTime } = req.body;
    
    // Find the appointment
    const appointmentData = await appointmentModel.findById(appointmentId);
    
    if (!appointmentData) {
      return res.json({ success: false, message: 'Appointment not found' });
    }
    
    // Verify that the appointment belongs to this user
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: 'Unauthorized action' });
    }
    
    // Check if appointment is already cancelled
    if (appointmentData.cancelled) {
      return res.json({ success: false, message: 'Cannot reschedule cancelled appointment' });
    }
    
    // Check if rescheduling is allowed based on settings
    const settings = await SlotSettings.findOne();
    
    if (settings && !settings.allowRescheduling) {
      return res.json({ success: false, message: 'Rescheduling is not allowed' });
    }
    
    // Check reschedule time constraints
    if (settings) {
      const now = new Date();
      const appointmentTime = new Date(`${appointmentData.slotDate}T${appointmentData.slotTime}`);
      const rescheduleTimeLimit = settings.rescheduleHoursBefore * 60 * 60 * 1000;
      
      if (appointmentTime - now < rescheduleTimeLimit) {
        return res.json({
          success: false,
          message: `Appointments can only be rescheduled ${settings.rescheduleHoursBefore} hours before the appointment time`
        });
      }
    }
    
    // Check if the new slot is valid
    const { slots, error } = await generateAvailableSlots(new Date(slotDate));
    
    if (error) {
      return res.json({ success: false, message: error });
    }
    
    // Check if requested time is in our generated slots
   const isValidSlot = slots.some(
  slot => slot.startTime === slotTime
);

if (!isValidSlot) {
  return res.json({ success: false, message: 'Invalid slot time' });
}

    
    // Get doctor data and check availability
    const { docId } = appointmentData;
    const docData = await doctorModel.findById(docId);
    
    if (!docData.available) {
      return res.json({ success: false, message: 'Stylist Not Available' });
    }
    
    // Check if the new slot is already booked
    let slots_booked = docData.slots_booked || {};
    
    if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: 'Slot Not Available' });
    }
    
    // Remove old slot booking
    const oldSlotDate = appointmentData.slotDate;
    const oldSlotTime = appointmentData.slotTime;
    
    if (slots_booked[oldSlotDate]) {
      slots_booked[oldSlotDate] = slots_booked[oldSlotDate].filter(time => time !== oldSlotTime);
    }
    
    // Add new slot booking
    if (slots_booked[slotDate]) {
      slots_booked[slotDate].push(slotTime);
    } else {
      slots_booked[slotDate] = [slotTime];
    }
    
    // Update appointment data
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      slotDate,
      slotTime,
      rescheduled: true
    });
    
    // Update doctor's slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    
    res.json({
      success: true,
      message: 'Appointment rescheduled successfully'
    });
    
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.json({ success: false, message: error.message });
  }
};
