import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Chrome } from 'lucide-react';
import RegisterImage from '../assets/image.jpeg';
import GoogleImage from '../assets/google-icon.png';

const Login = () => {
  const [state, setState] = useState('Sign Up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { backendUrl, token, setToken } = useContext(AppContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Sign Up') {
      const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password });

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        toast.error(data.message);
      }
    } else {
      const { data } = await axios.post(backendUrl + '/api/user/login', { email, password });

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        toast.error(data.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      window.location.href = `${backendUrl}/api/auth/google`;
    } catch (error) {
      toast.error("Google login failed. Please try again.");
      console.error("Google login error:", error);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <div className='min-h-[80vh] flex items-center justify-center'>
      <div className='w-full max-w-5xl flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden'>
        {/* Left side - Image */}
        <div className='w-full md:w-1/2 hidden md:block'>
          <img 
            src={RegisterImage}
            alt="Professional hairstylist" 
            className='w-full h-full object-cover'
          />
        </div>
        
        {/* Right side - Login Form */}
        <div className='w-full md:w-1/2 bg-white p-8'>
          <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
            <div className='text-center mb-4'>
              <h2 className='text-2xl font-semibold text-gray-800'>
                {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className='text-[#5E5E5E] text-sm mt-1'>
                Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book your styling session
              </p>
            </div>

            {state === 'Sign Up' && (
              <div className='w-full'>
                <p className='text-[#5E5E5E] mb-1'>Full Name</p>
                <input 
                  onChange={(e) => setName(e.target.value)} 
                  value={name} 
                  className='border border-[#DADADA] rounded w-full p-2 mt-1 focus:outline-primary' 
                  type="text" 
                  placeholder="Enter your full name"
                  required 
                />
              </div>
            )}
            
            <div className='w-full'>
              <p className='text-[#5E5E5E] mb-1'>Email</p>
              <input 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                className='border border-[#DADADA] rounded w-full p-2 mt-1 focus:outline-primary' 
                type="email" 
                placeholder="your@email.com"
                required 
              />
            </div>
            
            <div className='w-full'>
              <p className='text-[#5E5E5E] mb-1'>Password</p>
              <div className='relative'>
                <input 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password} 
                  className='border border-[#DADADA] rounded w-full p-2 mt-1 pr-10 focus:outline-primary' 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} 
                  className='absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-500'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button className='bg-primary text-white w-full py-2 my-2 rounded-md text-base hover:bg-primary/90 transition-colors'>
              {state === 'Sign Up' ? 'Create account' : 'Login'}
            </button>
            
            <div className='flex items-center my-3'>
              <div className='flex-grow border-t border-gray-300'></div>
              <span className='flex-shrink mx-4 text-gray-500 text-sm'>Or continue with</span>
              <div className='flex-grow border-t border-gray-300'></div>
            </div>
            
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className='w-full flex items-center justify-center gap-2 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors'
              >

              <img 
                src={GoogleImage}
                alt="Google Image" 
                className=' object-cover size-8'
              />
              
              <span>Google</span>
            </button>

            
            
            <div className='text-center mt-3'>
              {state === 'Sign Up' ? (
                <p className='text-sm text-[#5E5E5E]'>
                  Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span>
                </p>
              ) : (
                <p className='text-sm text-[#5E5E5E]'>
                  Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
