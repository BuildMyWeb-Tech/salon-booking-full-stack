// backend/routes/userRoute.js
import express from 'express';
import {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  listAppointment,
  paymentRazorpay,
  verifyRazorpay,
  paymentStripe,
  verifyStripe,
  cancelAppointment,
  bookAppointment,
  getAvailableDates,
  getAvailableSlots,
  getServices,
  getNotifications,
  markNotificationsRead,
  rescheduleAppointment,          // ✅ NEW
} from '../controllers/userController.js';

import {
  sendLoginOtp,
  verifyLoginOtp,
} from '../controllers/userPasswordController.js';

import authUser from '../middleware/authUser.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

/* ===================== AUTH ===================== */
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

/* ===================== OTP LOGIN ===================== */
userRouter.post('/send-login-otp', sendLoginOtp);
userRouter.post('/verify-login-otp', verifyLoginOtp);

/* ===================== PROFILE ===================== */
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile);

/* ===================== APPOINTMENTS ===================== */
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/reschedule-appointment', authUser, rescheduleAppointment); // ✅ NEW

/* ===================== SLOTS ===================== */
userRouter.get('/available-dates/:docId', authUser, getAvailableDates);
userRouter.get('/available-slots', authUser, getAvailableSlots);

/* ===================== SERVICES ===================== */
userRouter.get('/services', getServices);

/* ===================== NOTIFICATIONS ===================== */
userRouter.get('/notifications', authUser, getNotifications);
userRouter.post('/notifications/mark-read', authUser, markNotificationsRead);

/* ===================== PAYMENTS ===================== */
userRouter.post('/payment-razorpay', authUser, paymentRazorpay);
userRouter.post('/verify-razorpay', authUser, verifyRazorpay);
userRouter.post('/payment-stripe', authUser, paymentStripe);
userRouter.post('/verify-stripe', authUser, verifyStripe);

export default userRouter;