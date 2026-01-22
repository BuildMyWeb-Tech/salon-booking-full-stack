import express from 'express';
import { 
  loginAdmin, appointmentsAdmin, appointmentCancel, 
  addDoctor, allDoctors, adminDashboard,
  getSlotSettings, updateSlotSettings,
  addBlockedDate, removeBlockedDate,
  addRecurringHoliday, removeRecurringHoliday,
  addSpecialWorkingDay, removeSpecialWorkingDay, getPublicSlotSettings 
} from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.get("/slot-settings", authAdmin, getSlotSettings);
adminRouter.post("/slot-settings", authAdmin, updateSlotSettings);
adminRouter.post("/blocked-dates", authAdmin, addBlockedDate);
adminRouter.delete("/blocked-dates/:id", authAdmin, removeBlockedDate);
adminRouter.post("/recurring-holidays", authAdmin, addRecurringHoliday);
adminRouter.delete("/recurring-holidays/:id", authAdmin, removeRecurringHoliday);
adminRouter.post("/special-working-days", authAdmin, addSpecialWorkingDay);
adminRouter.delete("/special-working-days/:id", authAdmin, removeSpecialWorkingDay);
adminRouter.get("/public/slot-settings", getPublicSlotSettings);

export default adminRouter;