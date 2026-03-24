// frontend/src/pages/Login.jsx
// ✅ FIXED:
//   1. Reads ?error= param from URL and shows toast (e.g. after Google login failure)
//   2. After normal login/signup, explicitly loads user profile via loadUserProfileData
//   3. Everything else unchanged

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

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { backendUrl, token, setToken, loadUserProfileData } = useContext(AppContext);

  // ✅ Show error toast if redirected back from Google with ?error=
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'google_failed') {
      toast.error('Google login failed. Please try again.');
    } else if (error === 'google_login_failed') {
      toast.error('Could not complete Google login. Please try again.');
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate('/');
  }, [token]);

  // Only digits, max 10
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) setPhone(value);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Sign Up' && !/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', {
          name,
          email,
          password,
          phone,
        });

        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          // ✅ Immediately load profile — don't wait for useEffect cycle
          await loadUserProfileData(data.token);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          // ✅ Immediately load profile — don't wait for useEffect cycle
          await loadUserProfileData(data.token);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Server error. Please try again.');
    }
  };

  // ✅ Redirect to backend Google OAuth — works in both local and production
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
          <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-center">
              {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
            </h2>

            {state === 'Sign Up' && (
              <>
                <div>
                  <p>Full Name</p>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded w-full p-2"
                    type="text"
                    required
                  />
                </div>

                <div>
                  <p>Phone Number</p>
                  <input
                    value={phone}
                    onChange={handlePhoneChange}
                    className="border rounded w-full p-2"
                    type="tel"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <p>Email</p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded w-full p-2"
                type="email"
                required
              />
            </div>

            <div className="relative">
              <p>Password</p>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded w-full p-2 pr-10"
                type={showPassword ? 'text' : 'password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Forgot Password — Login tab only */}
            {state === 'Login' && (
              <div className="text-right -mt-2">
                <span
                  className="text-sm text-primary cursor-pointer hover:underline"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </span>
              </div>
            )}

            <button className="bg-primary text-white p-2 rounded">
              {state === 'Sign Up' ? 'Create Account' : 'Login'}
            </button>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="border p-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <img src={GoogleImage} className="w-6" alt="Google" />
              Continue with Google
            </button>

            {/* Toggle Sign Up / Login */}
            <p className="text-center text-sm">
              {state === 'Sign Up' ? (
                <>
                  Already have an account?{' '}
                  <span
                    className="text-primary cursor-pointer hover:underline"
                    onClick={() => setState('Login')}
                  >
                    Login
                  </span>
                </>
              ) : (
                <>
                  Create new account?{' '}
                  <span
                    className="text-primary cursor-pointer hover:underline"
                    onClick={() => setState('Sign Up')}
                  >
                    Sign Up
                  </span>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
