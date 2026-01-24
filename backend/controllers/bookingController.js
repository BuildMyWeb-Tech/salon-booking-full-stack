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

    // Validate date
    if (!date || isNaN(new Date(date).getTime())) {
      return res.json({ success: false, message: "Invalid date" });
    }

    // Validate doctor availability
    let doctor = null;
    if (docId) {
      doctor = await doctorModel.findById(docId);
      if (!doctor || !doctor.available) {
        return res.json({ success: false, message: "Stylist unavailable" });
      }
    }

    // Generate slots (backend source of truth)
    const { slots, error } = await generateAvailableSlots(date);
    if (error) {
      return res.json({ success: false, message: error });
    }

    // Filter booked slots for this doctor
    if (doctor) {
      const slotKey = date; // YYYY-MM-DD

      let bookedSlots = [];

      // Map-safe access
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

    // If no doctor filter
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
 * Book a new appointment with multiple services
 */
export const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime, services, totalAmount, paymentMethod } = req.body;
    
    // Basic validation
    if (!userId || !docId || !slotDate || !slotTime) {
      return res.json({ success: false, message: "Missing booking data" });
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.json({ success: false, message: "Please select at least one service" });
    }
    
    // slotTime MUST be ISO from frontend
    const slotDateTime = new Date(slotTime);
    
    if (isNaN(slotDateTime.getTime())) {
      return res.json({ success: false, message: "Invalid slot time" });
    }
    
    console.log("BOOK SLOT:", slotDate, slotDateTime.toISOString());
    console.log("USER ID:", userId);
    console.log("DOCTOR ID:", docId);
    console.log("SERVICES:", services);
    console.log("TOTAL AMOUNT:", totalAmount);
    
    // Fetch doctor and user for complete data
    const doctor = await doctorModel.findById(docId);
    if (!doctor || !doctor.available) {
      return res.json({ success: false, message: "Stylist unavailable" });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Backend slot validation
    const isAvailable = await isSlotAvailable(slotDate, slotDateTime.toISOString());
    if (!isAvailable) {
      return res.json({ success: false, message: "Slot no longer available" });
    }
    
    // Prevent double booking (doctor-side)
    const slotKey = slotDate; // YYYY-MM-DD
    
    if (!doctor.slots_booked) doctor.slots_booked = new Map();
    if (!doctor.slots_booked.get(slotKey)) {
      doctor.slots_booked.set(slotKey, []);
    }
    
    const bookedSlots = doctor.slots_booked.get(slotKey);
    
    if (bookedSlots.includes(slotDateTime.toISOString())) {
      return res.json({ success: false, message: "Slot already booked" });
    }
    
    // Lock slot
    bookedSlots.push(slotDateTime.toISOString());
    doctor.slots_booked.set(slotKey, bookedSlots);
    await doctor.save();
    
    // Format display time
    const displayTime = slotDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    // Create service names string for backward compatibility
    const serviceNames = services.map(s => s.name).join(', ');
    
    // Create appointment with complete data including multiple services
    const appointment = new appointmentModel({
      userId,
      doctorId: docId,
      slotDate,
      slotTime: displayTime,
      slotDateTime,
      amount: totalAmount,
      service: serviceNames, // Combined service names for display
      services: services, // Array of service objects
      payment: true,
      paymentMethod: paymentMethod || 'razorpay',
      userData: {
        name: user.name,
        phone: user.phone,
        image: user.image
      },
      docData: {
        name: doctor.name,
        image: doctor.image,
        speciality: doctor.specialty.join(', ')
      }
    });
    
    await appointment.save();
    
    return res.json({
      success: true,
      message: "Appointment booked successfully",
      appointmentId: appointment._id
    });
    
  } catch (error) {
    console.error("Booking error:", error);
    
    // Duplicate booking protection
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
    
    // Validate inputs
    if (!userId || !appointmentId || !slotDate || !slotTime) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    // Find the appointment
    const appointmentData = await appointmentModel.findById(appointmentId);
    
    if (!appointmentData) {
      return res.json({ success: false, message: 'Appointment not found' });
    }
    
    // Verify that the appointment belongs to this user
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: 'Unauthorized action' });
    }
    
    // Check if appointment is completed
    if (appointmentData.isCompleted) {
      return res.json({ success: false, message: 'Cannot reschedule completed appointment' });
    }
    
    // Check if rescheduling is allowed based on settings
    const settings = await SlotSettings.findOne();
    
    if (settings && !settings.allowRescheduling) {
      return res.json({ success: false, message: 'Rescheduling is not allowed' });
    }
    
    // Check reschedule time constraints (3 hours minimum)
    const now = new Date();
    
    // For cancelled appointments, skip time check
    if (!appointmentData.cancelled) {
      const appointmentTime = new Date(appointmentData.slotDateTime);
      const rescheduleTimeLimit = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
      
      if (appointmentTime - now < rescheduleTimeLimit) {
        return res.json({
          success: false,
          message: 'Appointments can only be rescheduled at least 3 hours before the appointment time'
        });
      }
    }
    
    // Validate new slot time (ISO string)
    const newSlotDateTime = new Date(slotTime);
    if (isNaN(newSlotDateTime.getTime())) {
      return res.json({ success: false, message: 'Invalid slot time format' });
    }
    
    // Check that new slot is at least 3 hours in the future
    const minFutureTime = 3 * 60 * 60 * 1000;
    if (newSlotDateTime - now < minFutureTime) {
      return res.json({
        success: false,
        message: 'New appointment must be at least 3 hours from now'
      });
    }
    
    // Check if the new slot is valid
    const { slots, error } = await generateAvailableSlots(slotDate);
    
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
    const docData = await doctorModel.findById(appointmentData.doctorId);
    
    if (!docData || !docData.available) {
      return res.json({ success: false, message: 'Stylist Not Available' });
    }
    
    // Check if the new slot is already booked
    let slots_booked = docData.slots_booked || new Map();
    
    // Convert to Map if needed
    if (!(slots_booked instanceof Map)) {
      const oldSlots = slots_booked;
      slots_booked = new Map();
      for (const [key, value] of Object.entries(oldSlots)) {
        slots_booked.set(key, value);
      }
    }
    
    const bookedSlotsForDate = slots_booked.get(slotDate) || [];
    
    if (bookedSlotsForDate.includes(slotTime)) {
      return res.json({ success: false, message: 'Slot Not Available' });
    }
    
    // Remove old slot booking
    const oldSlotDate = appointmentData.slotDate;
    const oldSlotDateTimeISO = appointmentData.slotDateTime.toISOString();
    
    const oldBookedSlots = slots_booked.get(oldSlotDate) || [];
    const updatedOldSlots = oldBookedSlots.filter(time => time !== oldSlotDateTimeISO);
    slots_booked.set(oldSlotDate, updatedOldSlots);
    
    // Add new slot booking
    const newBookedSlots = slots_booked.get(slotDate) || [];
    newBookedSlots.push(slotTime);
    slots_booked.set(slotDate, newBookedSlots);
    
    // Format display time
    const displayTime = newSlotDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    
    // Update appointment data
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      slotDate,
      slotTime: displayTime,
      slotDateTime: newSlotDateTime,
      rescheduled: true,
      cancelled: false, // Reset cancelled status
      cancelledBy: null
    });
    
    // Update doctor's slots
    await doctorModel.findByIdAndUpdate(appointmentData.doctorId, { slots_booked });
    
    res.json({
      success: true,
      message: 'Appointment rescheduled successfully'
    });
    
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.json({ success: false, message: error.message });
  }
};