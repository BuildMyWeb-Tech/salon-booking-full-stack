// backend/controllers/userPasswordController.js
// ✅ 2Factor.in — SMSOTPBALANCE route forces SMS only (no voice call)

import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Send OTP via 2Factor — SMS ONLY (no voice call) ──────────────────────────
const sendOTPviaSMS = async (phone, otp) => {
    // ✅ FIXED: Added /AUTOGEN3 at end — forces SMS delivery, never voice call
    // Format: /API/V1/{key}/SMS/{phone}/{otp}/AUTOGEN3
    const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${phone}/${otp}/AUTOGEN3`;

    const response = await axios.get(url, { timeout: 15000 });

    console.log('2Factor SMS response:', JSON.stringify(response.data));

    if (response.data?.Status !== 'Success') {
        throw new Error(response.data?.Details || '2Factor SMS failed');
    }

    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Send OTP
// POST /api/auth/forgot-password/send-otp
// ─────────────────────────────────────────────────────────────────────────────
export const sendPasswordResetOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone)
            return res.status(400).json({ success: false, message: 'Phone number is required' });

        const cleanPhone = phone.replace(/^\+91/, '').replace(/^0/, '').trim();

        if (!/^\d{10}$/.test(cleanPhone))
            return res.status(400).json({
                success: false,
                message: 'Enter a valid 10-digit phone number',
            });

        const user = await userModel.findOne({ phone: cleanPhone });
        if (!user)
            return res.status(404).json({
                success: false,
                message: 'No account found with this phone number',
            });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpiry = otpExpiry;
        user.otpVerified = false;
        await user.save();

        await sendOTPviaSMS(cleanPhone, otp);

        console.log(`✅ OTP SMS sent to +91${cleanPhone}`);
        res.json({ success: true, message: 'OTP sent successfully to your phone' });

    } catch (err) {
        console.error('sendPasswordResetOtp error:', err.message);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to send OTP. Please try again.',
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Verify OTP
// POST /api/auth/forgot-password/verify-otp
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPasswordResetOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp)
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });

        const cleanPhone = phone.replace(/^\+91/, '').replace(/^0/, '').trim();

        const user = await userModel.findOne({ phone: cleanPhone });
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.otp || !user.otpExpiry)
            return res.status(400).json({
                success: false,
                message: 'No OTP requested. Please request a new one.',
            });

        if (new Date() > user.otpExpiry)
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch)
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please check and try again.',
            });

        user.otpVerified = true;
        await user.save();

        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ success: true, message: 'OTP verified successfully', resetToken });

    } catch (err) {
        console.error('verifyPasswordResetOtp error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Reset Password
// POST /api/auth/forgot-password/reset-password
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword)
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required',
            });

        if (newPassword.length < 6)
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });

        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch {
            return res.status(400).json({
                success: false,
                message: 'Reset session expired. Please start again.',
            });
        }

        const user = await userModel.findById(decoded.userId);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.otpVerified)
            return res.status(403).json({
                success: false,
                message: 'OTP not verified. Please verify OTP first.',
            });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.otp = null;
        user.otpExpiry = null;
        user.otpVerified = false;

        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully. Please login with your new password.',
        });

    } catch (err) {
        console.error('resetPassword error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Change Password (logged-in user from MyProfile)
// ─────────────────────────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword)
            return res.status(400).json({ success: false, message: 'Both passwords are required' });

        const user = await userModel.findById(req.user.id);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.password)
            return res.status(400).json({
                success: false,
                message: 'Google login accounts cannot change password this way',
            });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });

        if (newPassword.length < 6)
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (err) {
        console.error('changePassword error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};