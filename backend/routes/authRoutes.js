// backend/routes/authRoutes.js
import express from 'express';
import passport from '../config/passport.js';
import { googleAuthCallback } from '../controllers/authController.js';
import {
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
} from '../controllers/userPasswordController.js';

const router = express.Router();

// ────────────────────────────────────────────
// Forgot Password Routes (Twilio OTP flow)
// ────────────────────────────────────────────
// POST /api/auth/forgot-password/send-otp
router.post('/forgot-password/send-otp', sendPasswordResetOtp);

// POST /api/auth/forgot-password/verify-otp
router.post('/forgot-password/verify-otp', verifyPasswordResetOtp);

// POST /api/auth/forgot-password/reset-password
router.post('/forgot-password/reset-password', resetPassword);

// ────────────────────────────────────────────
// Google OAuth Routes
// ────────────────────────────────────────────
// GET /api/auth/google  → redirect to Google consent screen
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// GET /api/auth/google/callback  → Google redirects here after login
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  googleAuthCallback // ✅ FIXED: uses dedicated handler in authController.js
);

export default router;
