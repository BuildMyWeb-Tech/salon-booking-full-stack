// C:\Users\Siddharathan\Desktop\salon-booking-full-stack\frontend\src\pages\ForgotPassword.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ✅ FIXED: correct backend port 4000, using /api/user routes
const API = 'http://localhost:4000/api/user';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=newpassword
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Only allow numbers, max 10 digits
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) setPhone(value);
  };

  // STEP 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phone)) {
      return setError('Please enter a valid 10-digit phone number');
    }

    setLoading(true);
    try {
      await axios.post(`${API}/send-reset-otp`, { phone });
      setSuccess('OTP sent to your phone!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/verify-reset-otp`, { phone, otp });
      setResetToken(res.data.resetToken);
      setSuccess('OTP verified!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await axios.post(`${API}/reset-password`, { resetToken, newPassword });
      setSuccess('Password updated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-center mb-2">
          {step === 1 && 'Forgot Password'}
          {step === 2 && 'Enter OTP'}
          {step === 3 && 'Reset Password'}
        </h2>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full ${step >= s ? 'bg-primary' : 'bg-gray-300'}`}
            />
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded p-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded p-3 mb-4">
            {success}
          </div>
        )}

        {/* STEP 1: Phone Number */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div>
              <p className="mb-1 font-medium">Phone Number</p>
              <input
                type="tel"
                placeholder="Enter your 10-digit number"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={10}
                required
                className="border rounded w-full p-2"
              />
              <p className="text-xs text-gray-400 mt-1">We'll send a 6-digit OTP to this number</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white p-2 rounded hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <p
              className="text-center text-sm text-primary cursor-pointer hover:underline"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </p>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
            <div>
              <p className="mb-1 font-medium">Enter OTP</p>
              <p className="text-sm text-gray-500 mb-2">
                Sent to <span className="font-semibold">{phone}</span>
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
                className="border rounded w-full p-2 text-center text-xl tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white p-2 rounded hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
                setSuccess('');
                setOtp('');
              }}
              className="text-sm text-center text-primary cursor-pointer hover:underline"
            >
              Change Number
            </button>
          </form>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <p className="mb-1 font-medium">New Password</p>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="border rounded w-full p-2"
              />
            </div>
            <div>
              <p className="mb-1 font-medium">Confirm Password</p>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border rounded w-full p-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white p-2 rounded hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
