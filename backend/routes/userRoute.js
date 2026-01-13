import express from 'express';
import { loginUser, registerUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, paymentStripe, verifyStripe } from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';
const userRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *         image:
 *           type: string
 *           description: URL to user's profile image
 *         phone:
 *           type: string
 *           description: User's phone number
 *         address:
 *           type: object
 *           description: User's address details
 *         dob:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: User's gender
 *       example:
 *         name: John Doe
 *         email: john@example.com
 *         password: password123
 *         phone: "1234567890"
 *         gender: male
 *         dob: "1990-01-01"
 *     
 *     Appointment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique appointment ID
 *         userId:
 *           type: string
 *           description: ID of the user who booked
 *         docId:
 *           type: string
 *           description: ID of the doctor
 *         slotDate:
 *           type: string
 *           format: date
 *           description: Date of appointment
 *         slotTime:
 *           type: string
 *           description: Time slot of appointment
 *         amount:
 *           type: number
 *           description: Appointment fee
 *         payment:
 *           type: boolean
 *           description: Payment status
 *         cancelled:
 *           type: boolean
 *           description: Cancellation status
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 */
userRouter.post("/register", registerUser)

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 */
userRouter.post("/login", loginUser)

/**
 * @swagger
 * /api/user/get-profile:
 *   get:
 *     summary: Get user profile information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 userData:
 *                   $ref: '#/components/schemas/User'
 */
userRouter.get("/get-profile", authUser, getProfile)

/**
 * @swagger
 * /api/user/update-profile:
 *   post:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *                 description: JSON string of address object
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)

/**
 * @swagger
 * /api/user/book-appointment:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - docId
 *               - slotDate
 *               - slotTime
 *             properties:
 *               docId:
 *                 type: string
 *               slotDate:
 *                 type: string
 *                 format: date
 *               slotTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
userRouter.post("/book-appointment", authUser, bookAppointment)

/**
 * @swagger
 * /api/user/appointments:
 *   get:
 *     summary: Get all appointments for the logged in user
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 */
userRouter.get("/appointments", authUser, listAppointment)

/**
 * @swagger
 * /api/user/cancel-appointment:
 *   post:
 *     summary: Cancel an appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
userRouter.post("/cancel-appointment", authUser, cancelAppointment)

/**
 * @swagger
 * /api/user/payment-razorpay:
 *   post:
 *     summary: Initiate Razorpay payment for appointment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   type: object
 */
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)

/**
 * @swagger
 * /api/user/verifyRazorpay:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)

/**
 * @swagger
 * /api/user/payment-stripe:
 *   post:
 *     summary: Initiate Stripe payment for appointment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stripe payment session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 session_url:
 *                   type: string
 */
userRouter.post("/payment-stripe", authUser, paymentStripe)

/**
 * @swagger
 * /api/user/verifyStripe:
 *   post:
 *     summary: Verify Stripe payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - success
 *             properties:
 *               appointmentId:
 *                 type: string
 *               success:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
userRouter.post("/verifyStripe", authUser, verifyStripe)

export default userRouter;