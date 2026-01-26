// backend/utils/slotUtils.js
import SlotSettings from '../models/SlotSettings.js';
import Appointment from '../models/appointmentModel.js';
import mongoose from 'mongoose';

/**
 * Generate available time slots for a specific date
 * ✅ PRODUCTION SAFE
 * ✅ NO ISO STRINGS
 * ✅ NO UTC / Z
 * ✅ PURE DATE + TIME STRINGS
 */
export const generateAvailableSlots = async (date, customSettings = null) => {
  try {
    console.log('🔧 === SLOT GENERATION START ===');
    console.log('📅 Input date:', date);

    const settings = customSettings || await SlotSettings.findOne();

    if (!settings) {
      console.log('⚠️ No slot settings found');
      return { slots: [], error: 'Slot settings not configured' };
    }

    console.log('⚙️ Loaded settings:', {
      slotStartTime: settings.slotStartTime,
      slotEndTime: settings.slotEndTime,
      slotDuration: settings.slotDuration,
      breakTime: settings.breakTime,
      breakStartTime: settings.breakStartTime,
      breakEndTime: settings.breakEndTime,
      daysOpen: settings.daysOpen,
    });

    // ✅ DATE STRING ONLY (NO toISOString)
    const dateStr = typeof date === 'string'
      ? date
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const [year, month, day] = dateStr.split('-').map(Number);

    console.log('📅 Parsed date:', dateStr);

    const selectedDate = new Date(year, month - 1, day);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    console.log('📅 Day of week:', dayName);

    if (!settings.daysOpen.includes(dayName)) {
      console.log(`⛔ ${dayName} is not open`);
      return { slots: [], error: 'Selected day is not available' };
    }

    const startTimeSetting = settings.slotStartTime || '09:00';
    const endTimeSetting = settings.slotEndTime || '17:00';
    const slotDuration = settings.slotDuration || 60;

    console.log(`🕒 Working hours: ${startTimeSetting} → ${endTimeSetting}`);
    console.log(`⏱️ Slot duration: ${slotDuration} mins`);

    const [startHour, startMinute] = startTimeSetting.split(':').map(Number);
    const [endHour, endMinute] = endTimeSetting.split(':').map(Number);

    let currentTime = new Date(year, month - 1, day, startHour, startMinute, 0, 0);
    let endDateTime = new Date(year, month - 1, day, endHour, endMinute, 0, 0);

    if (endDateTime <= currentTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const slots = [];
    const now = new Date();
    const minBookingBufferMs = (settings.minBookingTimeBeforeSlot || 0) * 60 * 60 * 1000;

    console.log('🔄 Starting slot loop');

    while (currentTime < endDateTime) {
      const slotStart = new Date(currentTime);

      // 🔕 Break handling
      let isDuringBreak = false;
      if (settings.breakTime) {
        const [bsH, bsM] = settings.breakStartTime.split(':').map(Number);
        const [beH, beM] = settings.breakEndTime.split(':').map(Number);

        const breakStart = new Date(year, month - 1, day, bsH, bsM);
        const breakEnd = new Date(year, month - 1, day, beH, beM);

        if (breakEnd <= breakStart) {
          breakEnd.setDate(breakEnd.getDate() + 1);
        }

        isDuringBreak = slotStart >= breakStart && slotStart < breakEnd;
      }

      const isTooSoon = slotStart <= new Date(now.getTime() + minBookingBufferMs);

      if (!isDuringBreak && !isTooSoon) {
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

        // ✅ FINAL FIX: ONLY TIME STRINGS
        const startTime = `${String(slotStart.getHours()).padStart(2, '0')}:${String(slotStart.getMinutes()).padStart(2, '0')}`;
        const endTime = `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}`;

        slots.push({
          date: dateStr,   // YYYY-MM-DD
          startTime,       // HH:mm
          endTime          // HH:mm
        });

        console.log(`✅ Slot added: ${dateStr} ${startTime} → ${endTime}`);
      }

      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }

    console.log(`✅ Generated ${slots.length} slots`);
    console.log('🔧 === SLOT GENERATION END ===');

    return { slots, error: null };

  } catch (error) {
    console.error('❌ Slot generation failed:', error);
    return { slots: [], error: 'Failed to generate slots' };
  }
};

/**
 * Check slot availability using DATE + TIME STRING
 */
export const isSlotAvailable = async (doctorId, date, time) => {
  try {
    // 🛡️ Safety checks
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      console.error('❌ Invalid doctorId passed to isSlotAvailable:', doctorId);
      return false;
    }

    if (!date || !time) {
      console.error('❌ Missing date or time in isSlotAvailable:', { date, time });
      return false;
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      slotDate: date,     // YYYY-MM-DD
      slotTime: time,     // HH:mm
      cancelled: false
    }).lean();

    return !existingAppointment;

  } catch (error) {
    console.error('❌ isSlotAvailable error:', error);
    return false;
  }
};