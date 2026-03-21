// C:\Users\Siddharathan\Desktop\salon-booking-full-stack\backend\controllers\authController.js
import twilio from "twilio";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Helper: generate 6-digit OTP
const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────
// STEP 1: Send OTP to phone number
// ─────────────────────────────────────────
const sendOTP = async(req, res) => {
    try {
        const { phone } = req.body;
        if (!phone)
            return res.status(400).json({ success: false, message: "Phone number is required" });

        const user = await userModel.findOne({ phone });
        if (!user)
            return res.status(404).json({ success: false, message: "No account found with this phone number" });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save hashed OTP to DB
        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpiry = otpExpiry;
        user.otpVerified = false;
        await user.save();

        // Send SMS via Twilio
        await client.messages.create({
            body: `Your OTP for password reset is: ${otp}. Valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        console.error("sendOTP error:", err);
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
};

// ─────────────────────────────────────────
// STEP 2: Verify OTP
// ─────────────────────────────────────────
const verifyOTP = async(req, res) => {
    try {
        const { phone, otp } = req.body;

        const user = await userModel.findOne({ phone });
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        if (!user.otp || !user.otpExpiry)
            return res.status(400).json({ success: false, message: "No OTP requested. Please request a new one." });

        if (new Date() > user.otpExpiry)
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch)
            return res.status(400).json({ success: false, message: "Invalid OTP" });

        // Mark OTP as verified
        user.otpVerified = true;
        await user.save();

        // Issue short-lived reset token
        const resetToken = jwt.sign({ userId: user._id },
            process.env.JWT_SECRET, { expiresIn: "15m" }
        );

        res.json({ success: true, message: "OTP verified", resetToken });
    } catch (err) {
        console.error("verifyOTP error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────
// STEP 3: Reset Password
// ─────────────────────────────────────────
const resetPassword = async(req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword)
            return res.status(400).json({ success: false, message: "Token and new password are required" });

        // Verify reset token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);

        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        if (!user.otpVerified)
            return res.status(403).json({ success: false, message: "OTP not verified. Please verify OTP first." });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        user.otp = null;
        user.otpExpiry = null;
        user.otpVerified = false;

        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        if (err.name === "TokenExpiredError")
            return res.status(400).json({ success: false, message: "Reset session expired. Please start again." });

        console.error("resetPassword error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export { sendOTP, verifyOTP, resetPassword };