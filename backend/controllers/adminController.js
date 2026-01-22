import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import SlotSettings from '../models/SlotSettings.js';
import BlockedDate from '../models/BlockedDate.js';
import RecurringHoliday from '../models/RecurringHoliday.js';
import SpecialWorkingDay from '../models/SpecialWorkingDay.js';

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Stylist
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, specialty, experience, about, price, certification, instagram, workingHours } = req.body
        const imageFile = req.file

        // checking for all data to add stylist
        if (!name || !email || !password || !specialty || !experience || !about || !price || !certification) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const stylistData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            specialty,
            certification,
            experience,
            about,
            price: Number(price),
            instagram: instagram || "",
            workingHours: workingHours || "10AM-7PM",
            date: Date.now()
        }

        const newStylist = new doctorModel(stylistData)
        await newStylist.save()
        res.json({ success: true, message: 'Stylist Added Successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get Slot Settings
export const getSlotSettings = async (req, res) => {
  try {
    // Find settings or create default if none exist
    let settings = await SlotSettings.findOne();
    if (!settings) {
      settings = await SlotSettings.create({});
    }

    // Get related data
    const blockedDates = await BlockedDate.find();
    const recurringHolidays = await RecurringHoliday.find();
    const specialWorkingDays = await SpecialWorkingDay.find();

    // Combine all data
    const response = {
      ...settings.toObject(),
      blockedDates,
      recurringHolidays,
      specialWorkingDays
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching slot settings:', error);
    res.status(500).json({ message: 'Failed to fetch slot settings', error: error.message });
  }
};

// Update Slot Settings
export const updateSlotSettings = async (req, res) => {
  try {
    // Extract settings from request body
    const {
      slotStartTime, slotEndTime, slotDuration, 
      breakTime, breakStartTime, breakEndTime, 
      daysOpen, openSlotsFromDate, openSlotsTillDate,
      allowRescheduling, rescheduleHoursBefore,
      maxAdvanceBookingDays, minBookingTimeBeforeSlot
    } = req.body;

    // Update or create settings
    let settings = await SlotSettings.findOne();
    if (settings) {
      // Update existing settings
      settings.slotStartTime = slotStartTime;
      settings.slotEndTime = slotEndTime;
      settings.slotDuration = slotDuration;
      settings.breakTime = breakTime;
      settings.breakStartTime = breakStartTime;
      settings.breakEndTime = breakEndTime;
      settings.daysOpen = daysOpen;
      settings.openSlotsFromDate = openSlotsFromDate;
      settings.openSlotsTillDate = openSlotsTillDate;
      settings.allowRescheduling = allowRescheduling;
      settings.rescheduleHoursBefore = rescheduleHoursBefore;
      settings.maxAdvanceBookingDays = maxAdvanceBookingDays;
      settings.minBookingTimeBeforeSlot = minBookingTimeBeforeSlot;
      
      await settings.save();
    } else {
      // Create new settings
      settings = await SlotSettings.create({
        slotStartTime, slotEndTime, slotDuration, 
        breakTime, breakStartTime, breakEndTime, 
        daysOpen, openSlotsFromDate, openSlotsTillDate,
        allowRescheduling, rescheduleHoursBefore,
        maxAdvanceBookingDays, minBookingTimeBeforeSlot
      });
    }

    res.status(200).json({ message: 'Slot settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating slot settings:', error);
    res.status(500).json({ message: 'Failed to update slot settings', error: error.message });
  }
};

// Add a blocked date
export const addBlockedDate = async (req, res) => {
  try {
    const { date, reason } = req.body;
    
    if (!date || !reason) {
      return res.status(400).json({ message: 'Date and reason are required' });
    }
    
    const blockedDate = await BlockedDate.create({ date, reason });
    
    res.status(201).json(blockedDate);
  } catch (error) {
    console.error('Error adding blocked date:', error);
    res.status(500).json({ message: 'Failed to add blocked date', error: error.message });
  }
};

// Remove a blocked date
export const removeBlockedDate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await BlockedDate.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Blocked date not found' });
    }
    
    res.status(200).json({ message: 'Blocked date removed successfully' });
  } catch (error) {
    console.error('Error removing blocked date:', error);
    res.status(500).json({ message: 'Failed to remove blocked date', error: error.message });
  }
};

// Add a recurring holiday
export const addRecurringHoliday = async (req, res) => {
  try {
    const { name, type, value } = req.body;
    
    if (!name || !type || !value) {
      return res.status(400).json({ message: 'Name, type and value are required' });
    }
    
    const holiday = await RecurringHoliday.create({ name, type, value });
    
    res.status(201).json(holiday);
  } catch (error) {
    console.error('Error adding recurring holiday:', error);
    res.status(500).json({ message: 'Failed to add recurring holiday', error: error.message });
  }
};

// Remove a recurring holiday
export const removeRecurringHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await RecurringHoliday.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Recurring holiday not found' });
    }
    
    res.status(200).json({ message: 'Recurring holiday removed successfully' });
  } catch (error) {
    console.error('Error removing recurring holiday:', error);
    res.status(500).json({ message: 'Failed to remove recurring holiday', error: error.message });
  }
};

// Add a special working day
export const addSpecialWorkingDay = async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const specialDay = await SpecialWorkingDay.create({ date });
    
    res.status(201).json(specialDay);
  } catch (error) {
    console.error('Error adding special working day:', error);
    res.status(500).json({ message: 'Failed to add special working day', error: error.message });
  }
};

// Remove a special working day
export const removeSpecialWorkingDay = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await SpecialWorkingDay.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Special working day not found' });
    }
    
    res.status(200).json({ message: 'Special working day removed successfully' });
  } catch (error) {
    console.error('Error removing special working day:', error);
    res.status(500).json({ message: 'Failed to remove special working day', error: error.message });
  }
};

// Public – Get Slot Settings (for users)
export const getPublicSlotSettings = async (req, res) => {
  try {
    const settings = await SlotSettings.findOne();
    if (!settings) {
      return res.status(200).json(null);
    }

    const blockedDates = await BlockedDate.find();
    const recurringHolidays = await RecurringHoliday.find();
    const specialWorkingDays = await SpecialWorkingDay.find();

    res.status(200).json({
      ...settings.toObject(),
      blockedDates,
      recurringHolidays,
      specialWorkingDays
    });
  } catch (error) {
    console.error("Public slot settings error:", error);
    res.status(500).json({ message: "Failed to fetch slot settings" });
  }
};


export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard,
       
}