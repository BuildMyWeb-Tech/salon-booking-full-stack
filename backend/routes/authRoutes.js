// C:\Users\Siddharathan\Desktop\salon-booking-full-stack\backend\routes\authRoutes.js
import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { sendOTP, verifyOTP, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// ---- Forgot Password Routes ----
router.post("/forgot-password/send-otp", sendOTP);
router.post("/forgot-password/verify-otp", verifyOTP);
router.post("/forgot-password/reset-password", resetPassword);

// ---- Google OAuth Routes ----
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    }),
    (req, res) => {
        // Generate JWT for the user
        const token = jwt.sign({ userId: req.user._id, name: req.user.name },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    }
);

export default router;