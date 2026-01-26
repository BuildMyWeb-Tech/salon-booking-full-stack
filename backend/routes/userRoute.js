import express from 'express';
import { 
    loginUser, 
    registerUser, 
    getProfile, 
    updateProfile, 
    listAppointment, 
    cancelAppointment, 
    paymentRazorpay, 
    verifyRazorpay, 
    paymentStripe, 
    verifyStripe 
} from '../controllers/userController.js';

import { 
    getAvailableSlots, 
    getAvailableDates,
    bookAppointment, 
    rescheduleAppointment 
} from '../controllers/bookingController.js';

import { getAllServices } from '../controllers/serviceCategoryController.js';

import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser)

userRouter.post("/login", loginUser)

userRouter.get("/get-profile", authUser, getProfile)

userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)

// Booking/appointment routes
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

// New slot management routes
userRouter.get('/available-dates/:docId',authUser,getAvailableDates);
userRouter.get("/available-slots", authUser, getAvailableSlots);
userRouter.post("/reschedule-appointment", authUser, rescheduleAppointment);
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)

userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
userRouter.post("/payment-stripe", authUser, paymentStripe)
userRouter.post("/verifyStripe", authUser, verifyStripe)

// Public route to get all service categories
userRouter.get('/services', getAllServices);

export default userRouter;