import SlotSettings from '../models/SlotSettings.js';
import BlockedDate from '../models/BlockedDate.js';
import RecurringHoliday from '../models/RecurringHoliday.js';
import SpecialWorkingDay from '../models/SpecialWorkingDay.js';

/**
 * Generate available time slots for a given date
 * @param {Date | string} date
 * @returns {Object} { slots } OR { error }
 */
export const generateAvailableSlots = async (date) => {
  try {
    if (!date) {
      throw new Error('Date is required for slot generation');
    }
    // -------------------------
    // 1. Validate date
    // -------------------------
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      throw new Error(`Invalid date passed: ${date}`);
    }
    // Normalize selected date
    selectedDate.setHours(0, 0, 0, 0);

    // -------------------------
    // 2. Load slot settings
    // -------------------------
    const settings = await SlotSettings.findOne();
    if (!settings) {
      return { error: 'Slot settings not configured' };
    }

    // -------------------------
    // 3. Date range checks
    // -------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { error: 'Cannot book slots for past dates' };
    }

    if (settings.openSlotsTillDate) {
      const maxDate = new Date(settings.openSlotsTillDate);
      maxDate.setHours(0, 0, 0, 0);

      if (selectedDate > maxDate) {
        return { error: 'Date is outside allowed booking range' };
      }
    }

    // -------------------------
    // 4. Day boundaries (SAFE)
    // -------------------------
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // -------------------------
    // 5. Blocked date check
    // -------------------------
    const blockedDate = await BlockedDate.findOne({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (blockedDate) {
      return { error: `Blocked: ${blockedDate.reason || 'Holiday'}` };
    }

    // -------------------------
    // 6. Day of week checks
    // -------------------------
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[selectedDate.getDay()];

    const isRegularWorkingDay = settings.daysOpen?.includes(dayOfWeek);

    const specialWorkingDay = await SpecialWorkingDay.findOne({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const recurringHoliday = await RecurringHoliday.findOne({
      $or: [
        { type: 'weekly', value: dayOfWeek },
        { type: 'monthly', value: selectedDate.getDate().toString() }
      ]
    });

    if ((!isRegularWorkingDay && !specialWorkingDay) || recurringHoliday) {
      return { error: 'No slots available on this day' };
    }

    // -------------------------
    // 7. Parse slot times
    // -------------------------
    const [startHour, startMinute] = settings.slotStartTime.split(':').map(Number);
    const [endHour, endMinute] = settings.slotEndTime.split(':').map(Number);

    const slotDurationMs = settings.slotDuration * 60 * 1000;

    // Slot day time bounds
    const slotStartDateTime = new Date(selectedDate);
    slotStartDateTime.setHours(startHour, startMinute, 0, 0);

    const slotEndDateTime = new Date(selectedDate);
    slotEndDateTime.setHours(endHour, endMinute, 0, 0);

    // -------------------------
    // 8. Break time (optional)
    // -------------------------
    let breakStart = null;
    let breakEnd = null;

    if (settings.breakTime) {
      const [bsH, bsM] = settings.breakStartTime.split(':').map(Number);
      const [beH, beM] = settings.breakEndTime.split(':').map(Number);

      breakStart = new Date(selectedDate);
      breakStart.setHours(bsH, bsM, 0, 0);

      breakEnd = new Date(selectedDate);
      breakEnd.setHours(beH, beM, 0, 0);
    }

    // -------------------------
    // 9. Generate slots
    // -------------------------
    const slots = [];
    let cursor = new Date(slotStartDateTime);

    while (cursor < slotEndDateTime) {
      const slotEnd = new Date(cursor.getTime() + slotDurationMs);

      // Skip break time
      if (
        breakStart &&
        breakEnd &&
        (
          (cursor >= breakStart && cursor < breakEnd) ||
          (slotEnd > breakStart && slotEnd <= breakEnd)
        )
      ) {
        cursor = slotEnd;
        continue;
      }

      slots.push({
        startTime: cursor.toISOString(),
        endTime: slotEnd.toISOString(),
        displayTime: `${cursor.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })} - ${slotEnd.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}`
      });

      cursor = slotEnd;
    }

    return { slots };

  } catch (error) {
    console.error('Error generating slots:', error.message);
    return { error: 'Failed to generate slots' };
  }
};

/**
 * Check if a slot is still available
 */
export const isSlotAvailable = async (date, startTime) => {
  const { slots } = await generateAvailableSlots(date);
  return slots.some(slot => slot.startTime === startTime);
};


