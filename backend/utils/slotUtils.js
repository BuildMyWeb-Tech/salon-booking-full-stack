// backend/utils/slotUtils.js
import SlotSettings from '../models/SlotSettings.js';
import BlockedDate from '../models/BlockedDate.js';
import RecurringHoliday from '../models/RecurringHoliday.js';
import SpecialWorkingDay from '../models/SpecialWorkingDay.js';

/**
 * Generate available time slots for a specific date
 */
export const generateAvailableSlots = async (dateString) => {
  try {
    const settings = await SlotSettings.findOne();
    
    if (!settings) {
      return { 
        slots: [], 
        error: "Slot settings not configured" 
      };
    }

    // ✅ FIX: Use date-only comparison (ignore time)
    const requestDate = new Date(dateString);
    requestDate.setHours(0, 0, 0, 0);
    
    const fromDate = new Date(settings.openSlotsFromDate);
    fromDate.setHours(0, 0, 0, 0);
    
    const tillDate = new Date(settings.openSlotsTillDate);
    tillDate.setHours(23, 59, 59, 999);
    
    console.log('📅 Date validation:', {
      requestDate: requestDate.toISOString(),
      fromDate: fromDate.toISOString(),
      tillDate: tillDate.toISOString(),
      isValid: requestDate >= fromDate && requestDate <= tillDate
    });

    // Check if date is within the configured booking range
    if (requestDate < fromDate || requestDate > tillDate) {
      return { 
        slots: [], 
        error: "Date outside booking range" 
      };
    }

    // Check if date is blocked
    const blockedDates = await BlockedDate.find();
    const isBlocked = blockedDates.some(bd => {
      const blockedDate = new Date(bd.date);
      blockedDate.setHours(0, 0, 0, 0);
      return blockedDate.getTime() === requestDate.getTime();
    });
    
    if (isBlocked) {
      return { 
        slots: [], 
        error: "Date is blocked" 
      };
    }

    // Check if it's a working day
    const dayName = requestDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check for special working days
    const specialWorkingDays = await SpecialWorkingDay.find();
    const isSpecialWorkingDay = specialWorkingDays.some(swd => {
      const specialDate = new Date(swd.date);
      specialDate.setHours(0, 0, 0, 0);
      return specialDate.getTime() === requestDate.getTime();
    });

    // Check for recurring holidays
    const recurringHolidays = await RecurringHoliday.find();
    const isRecurringHoliday = recurringHolidays.some(rh => {
      if (rh.type === 'weekly') {
        return rh.value === dayName;
      } else if (rh.type === 'monthly') {
        return parseInt(rh.value) === requestDate.getDate();
      }
      return false;
    });

    if (isRecurringHoliday && !isSpecialWorkingDay) {
      return { 
        slots: [], 
        error: "Recurring holiday" 
      };
    }

    if (!settings.daysOpen.includes(dayName) && !isSpecialWorkingDay) {
      return { 
        slots: [], 
        error: "Not a working day" 
      };
    }

    // Check minimum booking time
    const now = new Date();
    const minBookingTime = settings.minBookingTimeBeforeSlot || 0;
    const earliestBookingTime = new Date(now.getTime() + minBookingTime * 60 * 60 * 1000);

    if (requestDate.getTime() === now.setHours(0, 0, 0, 0) && earliestBookingTime > now) {
      // For today, only show slots after the minimum booking time
    }

    // Generate time slots
    const slots = [];
    const [startHour, startMin] = settings.slotStartTime.split(':').map(Number);
    const [endHour, endMin] = settings.slotEndTime.split(':').map(Number);
    
    let currentTime = new Date(requestDate);
    currentTime.setHours(startHour, startMin, 0, 0);
    
    const endTime = new Date(requestDate);
    endTime.setHours(endHour, endMin, 0, 0);

    // Handle break time
    let breakStart = null;
    let breakEnd = null;
    
    if (settings.breakTime && settings.breakStartTime && settings.breakEndTime) {
      const [breakStartHour, breakStartMin] = settings.breakStartTime.split(':').map(Number);
      const [breakEndHour, breakEndMin] = settings.breakEndTime.split(':').map(Number);
      
      breakStart = new Date(requestDate);
      breakStart.setHours(breakStartHour, breakStartMin, 0, 0);
      
      breakEnd = new Date(requestDate);
      breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);
    }

    while (currentTime < endTime) {
      const slotTime = new Date(currentTime);
      
      // Skip if slot is in break time
      if (breakStart && breakEnd && slotTime >= breakStart && slotTime < breakEnd) {
        currentTime.setMinutes(currentTime.getMinutes() + settings.slotDuration);
        continue;
      }

      // Skip past slots for today
      if (requestDate.toDateString() === now.toDateString() && slotTime <= earliestBookingTime) {
        currentTime.setMinutes(currentTime.getMinutes() + settings.slotDuration);
        continue;
      }

      slots.push({
        startTime: slotTime.toISOString(),
        displayTime: slotTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      });

      currentTime.setMinutes(currentTime.getMinutes() + settings.slotDuration);
    }

    return { slots, error: null };

  } catch (error) {
    console.error('Error generating slots:', error);
    return { 
      slots: [], 
      error: error.message 
    };
  }
};

/**
 * Check if a specific slot is available
 */
export const isSlotAvailable = async (dateString, slotTimeISO) => {
  try {
    const { slots, error } = await generateAvailableSlots(dateString);
    
    if (error) {
      return false;
    }

    return slots.some(slot => slot.startTime === slotTimeISO);
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
};