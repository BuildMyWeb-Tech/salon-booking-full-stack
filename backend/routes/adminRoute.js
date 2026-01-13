import express from 'express';
import { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: Admin email (set in environment variables)
 *         password:
 *           type: string
 *           description: Admin password (set in environment variables)
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
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
 *                 description: Admin email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Login result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                   description: JWT token for admin authentication
 */
adminRouter.post("/login", loginAdmin)

/**
 * @swagger
 * /api/admin/add-doctor:
 *   post:
 *     summary: Add a new doctor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - speciality
 *               - degree
 *               - experience
 *               - about
 *               - fees
 *               - address
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Doctor's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Doctor's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Doctor's initial password
 *               speciality:
 *                 type: string
 *                 description: Doctor's specialization
 *               degree:
 *                 type: string
 *                 description: Doctor's qualification/degree
 *               experience:
 *                 type: number
 *                 description: Years of experience
 *               about:
 *                 type: string
 *                 description: Description about the doctor
 *               fees:
 *                 type: number
 *                 description: Consultation fees
 *               address:
 *                 type: string
 *                 description: JSON string of doctor's address
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Doctor's profile image
 *     responses:
 *       200:
 *         description: Doctor addition result
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
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)

/**
 * @swagger
 * /api/admin/appointments:
 *   get:
 *     summary: Get all appointments (admin access)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all appointments
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
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)

/**
 * @swagger
 * /api/admin/cancel-appointment:
 *   post:
 *     summary: Cancel an appointment (admin access)
 *     tags: [Admin]
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
 *                 description: ID of the appointment to cancel
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
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)

/**
 * @swagger
 * /api/admin/all-doctors:
 *   get:
 *     summary: Get all doctors (admin access)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all doctors
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
adminRouter.get("/all-doctors", authAdmin, allDoctors)

/**
 * @swagger
 * /api/admin/change-availability:
 *   post:
 *     summary: Change doctor availability (admin access)
 *     tags: [Admin]
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
 *             properties:
 *               docId:
 *                 type: string
 *                 description: ID of the doctor
 *     responses:
 *       200:
 *         description: Availability change result
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
adminRouter.post("/change-availability", authAdmin, changeAvailablity)

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
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
 *                     doctors:
 *                       type: number
 *                       description: Total number of doctors
 *                     appointments:
 *                       type: number
 *                       description: Total number of appointments
 *                     patients:
 *                       type: number
 *                       description: Total number of patients/users
 *                     latestAppointments:
 *                       type: array
 *                       description: Recent appointments
 *                       items:
 *                         $ref: '#/components/schemas/Appointment'
 */
adminRouter.get("/dashboard", authAdmin, adminDashboard)

export default adminRouter;