// frontend/src/pages/Login.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import RegisterImage from '../assets/image.jpeg';
import GoogleImage from '../assets/google-icon.png';

const Login = () => {
  const [state, setState] = useState('Sign Up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP step state
  const [step, setStep] = useState(1); // 1=credentials, 2=otp
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { backendUrl, token, setToken, loadUserProfileData } = useContext(AppContext);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'google_failed') toast.error('Google login failed. Please try again.');
    else if (error === 'google_login_failed') toast.error('Could not complete Google login. Please try again.');
  }, []);

  useEffect(() => {
    if (token) navigate('/');
  }, [token]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) setPhone(value);
  };

  // Step 1: For Sign Up — register directly. For Login — send OTP first.
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Sign Up') {
      if (!/^\d{10}$/.test(phone)) {
        toast.error('Phone number must be exactly 10 digits');
        return;
      }
      try {
        const { data } = await axios.post(backendUrl + '/api/user/register', {
          name, email, password, phone,
        });
        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          await loadUserProfileData(data.token);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error. Please try again.');
      }
    } else {
      // Login — verify credentials then send OTP
      try {
        const { data } = await axios.post(backendUrl + '/api/user/send-login-otp', {
          email, password,
        });
        if (data.success) {
          toast.success('OTP sent to your email!');
          setStep(2);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setOtpLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/user/verify-login-otp', { email, otp });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        await loadUserProfileData(data.token);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/user/send-login-otp', { email, password });
      if (data.success) {
        toast.success('OTP resent to your email!');
        setOtp('');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden">
        {/* Left Image */}
        <div className="w-full md:w-1/2 hidden md:block">
          <img src={RegisterImage} alt="Register" className="w-full h-full object-cover" />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 bg-white p-4">

          {/* ── STEP 1: Credentials ── */}
          {step === 1 && (
            <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-center">
                {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
              </h2>

              {state === 'Sign Up' && (
                <>
                  <div>
                    <p>Full Name</p>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      className="border rounded w-full p-2" type="text" required />
                  </div>
                  <div>
                    <p>Phone Number</p>
                    <input value={phone} onChange={handlePhoneChange}
                      className="border rounded w-full p-2" type="tel"
                      maxLength={10} pattern="[0-9]{10}"
                      placeholder="10-digit mobile number" required />
                  </div>
                </>
              )}

              <div>
                <p>Email</p>
                <input value={email} onChange={(e) => setEmail(e.target.value)}
                  className="border rounded w-full p-2" type="email" required />
              </div>

              <div className="relative">
                <p>Password</p>
                <input value={password} onChange={(e) => setPassword(e.target.value)}
                  className="border rounded w-full p-2 pr-10"
                  type={showPassword ? 'text' : 'password'} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {state === 'Login' && (
                <div className="text-right -mt-2">
                  <span className="text-sm text-primary cursor-pointer hover:underline"
                    onClick={() => navigate('/forgot-password')}>
                    Forgot Password?
                  </span>
                </div>
              )}

              <button className="bg-primary text-white p-2 rounded">
                {state === 'Sign Up' ? 'Create Account' : 'Continue'}
              </button>

              <button type="button" onClick={handleGoogleLogin}
                className="border p-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <img src={GoogleImage} className="w-6" alt="Google" />
                Continue with Google
              </button>

              <p className="text-center text-sm">
                {state === 'Sign Up' ? (
                  <>Already have an account?{' '}
                    <span className="text-primary cursor-pointer hover:underline"
                      onClick={() => setState('Login')}>Login</span></>
                ) : (
                  <>Create new account?{' '}
                    <span className="text-primary cursor-pointer hover:underline"
                      onClick={() => setState('Sign Up')}>Sign Up</span></>
                )}
              </p>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-semibold">Verify OTP</h2>
                <p className="text-sm text-gray-500 mt-1">
                  A 6-digit OTP was sent to <span className="font-semibold text-gray-700">{email}</span>
                </p>
              </div>

              {/* Step dots */}
              <div className="flex justify-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>

              <div>
                <p className="mb-1">Enter OTP</p>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="border rounded w-full p-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="● ● ● ● ● ●"
                  required
                />
              </div>

              <button type="submit" disabled={otpLoading}
                className="bg-primary text-white p-2 rounded disabled:opacity-60">
                {otpLoading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="flex justify-between text-sm">
                <button type="button"
                  onClick={() => { setStep(1); setOtp(''); }}
                  className="text-gray-500 hover:underline">
                  ← Back
                </button>
                <button type="button" onClick={handleResendOtp} disabled={resendLoading}
                  className="text-primary hover:underline disabled:opacity-60">
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;