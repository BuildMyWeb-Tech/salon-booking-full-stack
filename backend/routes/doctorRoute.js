import express from 'express';
import { loginDoctor, appointmentsDoctor, appointmentCancel, doctorList, changeAvailablity, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile } from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
const doctorRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Doctor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Doctor's unique ID
 *         name:
 *           type: string
 *           description: Doctor's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Doctor's email address
 *         fees:
 *           type: number
 *           description: Doctor's consultation fees
 *         address:
 *           type: string
 *           description: Doctor's address
 *         specialization:
 *           type: string
 *           description: Doctor's specialization
 *         qualification:
 *           type: string
 *           description: Doctor's qualifications
 *         experience:
 *           type: number
 *           description: Years of experience
 *         available:
 *           type: boolean
 *           description: Whether the doctor is available for appointments
 *         image:
 *           type: string
 *           description: URL to doctor's profile image
 *         slots_booked:
 *           type: object
 *           description: Object mapping dates to booked time slots
 */

/**
 * @swagger
 * /api/doctor/login:
 *   post:
 *     summary: Login for doctors
 *     tags: [Doctor]
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
doctorRouter.post("/login", loginDoctor)

/**
 * @swagger
 * /api/doctor/cancel-appointment:
 *   post:
 *     summary: Cancel an appointment (doctor access)
 *     tags: [Doctor Appointments]
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
 *         description: Appointment cancellation result
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
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)

/**
 * @swagger
 * /api/doctor/appointments:
 *   get:
 *     summary: Get all appointments for a doctor
 *     tags: [Doctor Appointments]
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
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)

/**
 * @swagger
 * /api/doctor/list:
 *   get:
 *     summary: Get list of all doctors
 *     tags: [Doctor]
 *     responses:
 *       200:
 *         description: List of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 doctors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Doctor'
 */
doctorRouter.get("/list", doctorList)

/**
 * @swagger
 * /api/doctor/change-availability:
 *   post:
 *     summary: Toggle doctor's availability status
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability status changed
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
doctorRouter.post("/change-availability", authDoctor, changeAvailablity)

/**
 * @swagger
 * /api/doctor/complete-appointment:
 *   post:
 *     summary: Mark an appointment as completed
 *     tags: [Doctor Appointments]
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
 *         description: Appointment completion result
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
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)

/**
 * @swagger
 * /api/doctor/dashboard:
 *   get:
 *     summary: Get dashboard statistics for a doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dashData:
 *                   type: object
 *                   properties:
 *                     earnings:
 *                       type: number
 *                     appointments:
 *                       type: number
 *                     patients:
 *                       type: number
 *                     latestAppointments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Appointment'
 */
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)

/**
 * @swagger
 * /api/doctor/profile:
 *   get:
 *     summary: Get doctor's profile information
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 profileData:
 *                   $ref: '#/components/schemas/Doctor'
 */
doctorRouter.get("/profile", authDoctor, doctorProfile)

/**
 * @swagger
 * /api/doctor/update-profile:
 *   post:
 *     summary: Update doctor's profile
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fees:
 *                 type: number
 *               address:
 *                 type: string
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile update result
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
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile)

export default doctorRouter;
