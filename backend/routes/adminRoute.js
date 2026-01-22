import express from 'express';
import { 
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  addDoctor,
  allDoctors,
  adminDashboard,
  getSlotSettings,
  updateSlotSettings,
  addBlockedDate,
  removeBlockedDate,
  addRecurringHoliday,
  removeRecurringHoliday,
  addSpecialWorkingDay,
  removeSpecialWorkingDay,
  getPublicSlotSettings,
  markAppointmentCompleted,
  markAppointmentIncomplete
} from '../controllers/adminController.js';

import {
  getAllServices,
  createService,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/serviceCategoryController.js';

import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();

/* ===================== AUTH ===================== */
adminRouter.post("/login", loginAdmin);

/* ===================== DOCTORS ===================== */
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailablity);

/* ===================== APPOINTMENTS ===================== */
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.post("/mark-appointment-completed", authAdmin, markAppointmentCompleted);
adminRouter.post("/mark-appointment-incomplete", authAdmin, markAppointmentIncomplete);

/* ===================== DASHBOARD ===================== */
adminRouter.get("/dashboard", authAdmin, adminDashboard);

/* ===================== SLOT SETTINGS ===================== */
adminRouter.get("/slot-settings", authAdmin, getSlotSettings);
adminRouter.post("/slot-settings", authAdmin, updateSlotSettings);
adminRouter.post("/blocked-dates", authAdmin, addBlockedDate);
adminRouter.delete("/blocked-dates/:id", authAdmin, removeBlockedDate);
adminRouter.post("/recurring-holidays", authAdmin, addRecurringHoliday);
adminRouter.delete("/recurring-holidays/:id", authAdmin, removeRecurringHoliday);
adminRouter.post("/special-working-days", authAdmin, addSpecialWorkingDay);
adminRouter.delete("/special-working-days/:id", authAdmin, removeSpecialWorkingDay);
adminRouter.get("/public/slot-settings", getPublicSlotSettings);

/* ===================== SERVICE CATEGORIES ===================== */
// ✅ Uses Cloudinary upload middleware
adminRouter.get("/services", authAdmin, getAllServices);
adminRouter.post("/services", authAdmin, upload.single('image'), createService);
adminRouter.get("/services/:id", authAdmin, getServiceById);
adminRouter.put("/services/:id", authAdmin, upload.single('image'), updateService);
adminRouter.delete("/services/:id", authAdmin, deleteService);

export default adminRouter;