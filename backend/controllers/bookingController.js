// backend/controllers/bookingController.js
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

    if (!date || isNaN(new Date(date).getTime())) {
      return res.json({ success: false, message: "Invalid date" });
    }

    let doctor = null;
    if (docId) {
      doctor = await doctorModel.findById(docId);
      if (!doctor || !doctor.available) {
        return res.json({ success: false, message: "Stylist unavailable" });
      }
    }

    const { slots, error } = await generateAvailableSlots(date);
    if (error) {
      return res.json({ success: false, message: error });
    }

    if (doctor) {
      const slotKey = date;
      let bookedSlots = [];

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
 * Book a new appointment with multiple services and payment percentage
 */
export const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime, services, totalAmount, paymentMethod } = req.body;
    
    if (!userId || !docId || !slotDate || !slotTime) {
      return res.json({ success: false, message: "Missing booking data" });
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.json({ success: false, message: "Please select at least one service" });
    }
    
    const slotDateTime = new Date(slotTime);
    
    if (isNaN(slotDateTime.getTime())) {
      return res.json({ success: false, message: "Invalid slot time" });
    }
    
    // Get settings for payment percentage
    const settings = await SlotSettings.findOne();
    
    // Calculate payment amount based on percentage
    let paymentAmount = totalAmount;
    let paymentPercentage = 100;
    
    if (settings && settings.advancePaymentRequired) {
      paymentPercentage = settings.advancePaymentPercentage || 100;
      paymentAmount = Math.round((totalAmount * paymentPercentage) / 100);
    }
    
    const doctor = await doctorModel.findById(docId);
    if (!doctor || !doctor.available) {
      return res.json({ success: false, message: "Stylist unavailable" });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    const isAvailable = await isSlotAvailable(slotDate, slotDateTime.toISOString());
    if (!isAvailable) {
      return res.json({ success: false, message: "Slot no longer available" });
    }
    
    const slotKey = slotDate;
    
    if (!doctor.slots_booked) doctor.slots_booked = new Map();
    if (!doctor.slots_booked.get(slotKey)) {
      doctor.slots_booked.set(slotKey, []);
    }
    
    const bookedSlots = doctor.slots_booked.get(slotKey);
    
    if (bookedSlots.includes(slotDateTime.toISOString())) {
      return res.json({ success: false, message: "Slot already booked" });
    }
    
    bookedSlots.push(slotDateTime.toISOString());
    doctor.slots_booked.set(slotKey, bookedSlots);
    
    // FIX: Use findByIdAndUpdate to update only slots_booked field
    // This bypasses validation for other fields
    await doctorModel.findByIdAndUpdate(
      docId,
      { slots_booked: doctor.slots_booked },
      { runValidators: false } // Skip validation
    );
    
    const displayTime = slotDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const serviceNames = services.map(s => s.name).join(', ');
    
    const appointment = new appointmentModel({
      userId,
      doctorId: docId,
      slotDate,
      slotTime: displayTime,
      slotDateTime,
      amount: totalAmount,
      paidAmount: paymentAmount,
      paymentPercentage: paymentPercentage,
      service: serviceNames,
      services: services,
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
      appointmentId: appointment._id,
      paidAmount: paymentAmount,
      remainingAmount: totalAmount - paymentAmount
    });
    
  } catch (error) {
    console.error("Booking error:", error);
    
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
    
    if (!userId || !appointmentId || !slotDate || !slotTime) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    const appointmentData = await appointmentModel.findById(appointmentId);
    
    if (!appointmentData) {
      return res.json({ success: false, message: 'Appointment not found' });
    }
    
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: 'Unauthorized action' });
    }
    
    if (appointmentData.isCompleted) {
      return res.json({ success: false, message: 'Cannot reschedule completed appointment' });
    }
    
    const settings = await SlotSettings.findOne();
    
    if (settings && !settings.allowRescheduling) {
      return res.json({ success: false, message: 'Rescheduling is not allowed' });
    }
    
    const now = new Date();
    
    if (!appointmentData.cancelled) {
      const appointmentTime = new Date(appointmentData.slotDateTime);
      const rescheduleHours = settings?.rescheduleHoursBefore || 3;
      const rescheduleTimeLimit = rescheduleHours * 60 * 60 * 1000;
      
      if (appointmentTime - now < rescheduleTimeLimit) {
        return res.json({
          success: false,
          message: `Appointments can only be rescheduled at least ${rescheduleHours} hours before the appointment time`
        });
      }
    }
    
    const newSlotDateTime = new Date(slotTime);
    if (isNaN(newSlotDateTime.getTime())) {
      return res.json({ success: false, message: 'Invalid slot time format' });
    }
    
    const rescheduleHours = settings?.rescheduleHoursBefore || 3;
    const minFutureTime = rescheduleHours * 60 * 60 * 1000;
    if (newSlotDateTime - now < minFutureTime) {
      return res.json({
        success: false,
        message: `New appointment must be at least ${rescheduleHours} hours from now`
      });
    }
    
    const { slots, error } = await generateAvailableSlots(slotDate);
    
    if (error) {
      return res.json({ success: false, message: error });
    }
    
    const isValidSlot = slots.some(
      slot => slot.startTime === slotTime
    );

    if (!isValidSlot) {
      return res.json({ success: false, message: 'Invalid slot time' });
    }
    
    const docData = await doctorModel.findById(appointmentData.doctorId);
    
    if (!docData || !docData.available) {
      return res.json({ success: false, message: 'Stylist Not Available' });
    }
    
    let slots_booked = docData.slots_booked || new Map();
    
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
    
    const oldSlotDate = appointmentData.slotDate;
    const oldSlotDateTimeISO = appointmentData.slotDateTime.toISOString();
    
    const oldBookedSlots = slots_booked.get(oldSlotDate) || [];
    const updatedOldSlots = oldBookedSlots.filter(time => time !== oldSlotDateTimeISO);
    slots_booked.set(oldSlotDate, updatedOldSlots);
    
    const newBookedSlots = slots_booked.get(slotDate) || [];
    newBookedSlots.push(slotTime);
    slots_booked.set(slotDate, newBookedSlots);
    
    const displayTime = newSlotDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      slotDate,
      slotTime: displayTime,
      slotDateTime: newSlotDateTime,
      rescheduled: true,
      cancelled: false,
      cancelledBy: null
    });
    
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