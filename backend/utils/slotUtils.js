// backend/utils/slotUtils.js
import SlotSettings from '../models/SlotSettings.js';
import BlockedDate from '../models/BlockedDate.js';
import RecurringHoliday from '../models/RecurringHoliday.js';
import SpecialWorkingDay from '../models/SpecialWorkingDay.js';

/**
 * Generate available time slots for a specific date
 */
export const generateAvailableSlots = async (date, customSettings = null) => {
  try {
    // Get settings from database or use provided custom settings
    const settings = customSettings || await SlotSettings.findOne();
    
    if (!settings) {
      return { 
        slots: [],
        error: "Slot settings not configured" 
      };
    }
    
    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if the selected day is in the allowed days
    if (!settings.daysOpen.includes(dayName)) {
      return { 
        slots: [],
        error: "Selected day is not available for booking" 
      };
    }
    
    // Parse start and end times from settings
    const startTime = settings.slotStartTime || "09:00";
    const endTime = settings.slotEndTime || "17:00";
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const slotDuration = settings.slotDuration || 30; // in minutes
    
    // Create date objects for start and end times
    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // Create slots within the time range
    const slots = [];
    let currentTime = new Date(startDateTime);
    
    while (currentTime < endDateTime) {
      const slotStartTime = new Date(currentTime);
      
      // Check if this time is during break
      let isDuringBreak = false;
      if (settings.breakTime) {
        const [breakStartHour, breakStartMinute] = settings.breakStartTime.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = settings.breakEndTime.split(':').map(Number);
        
        const breakStart = new Date(date);
        breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);
        
        const breakEnd = new Date(date);
        breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0);
        
        isDuringBreak = slotStartTime >= breakStart && slotStartTime < breakEnd;
      }
      
      if (!isDuringBreak) {
        slots.push({
          startTime: slotStartTime.toISOString(),
          endTime: new Date(slotStartTime.getTime() + slotDuration * 60000).toISOString()
        });
      }
      
      // Move to the next slot
      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }
    
    return { slots, error: null };
    
  } catch (error) {
    console.error("Error generating slots:", error);
    return { slots: [], error: "Failed to generate slots" };
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