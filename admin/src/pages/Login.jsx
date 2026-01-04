import React, { useContext, useState } from 'react';
import axios from 'axios';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import RegisterImage from '../assets/image.png';

const AdminLogin = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { setDToken } = useContext(DoctorContext);
  const { setAToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Admin') {
      const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password });
      if (data.success) {
        setAToken(data.token);
        localStorage.setItem('aToken', data.token);
      } else {
        toast.error(data.message);
      }
    } else {
      const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password });
      if (data.success) {
        setDToken(data.token);
        localStorage.setItem('dToken', data.token);
      } else {
        toast.error(data.message);
      }
    }
  };

  return (
    <div className='min-h-[80vh] flex items-center justify-center pt-8'>
      <div className='w-full max-w-5xl flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden'>
        {/* Left side - Image */}
        <div className='w-full md:w-1/2 hidden md:block'>
          <img 
            src={RegisterImage}
            alt={state === 'Admin' ? "Admin dashboard" : "Professional stylist"} 
            className='w-full h-full object-cover'
          />
        </div>
        
        {/* Right side - Login Form */}
        <div className='w-full md:w-1/2 bg-white p-8'>
          <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-semibold text-gray-800'>
                <span className='text-primary'>{state}</span> Login
              </h2>
              <p className='text-[#5E5E5E] text-sm mt-1'>
                Please log in to access the {state.toLowerCase()} dashboard
              </p>
            </div>
            
            <div className='w-full'>
              <p className='text-[#5E5E5E] mb-1'>Email</p>
              <input 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                className='border border-[#DADADA] rounded w-full p-2 mt-1 focus:outline-primary' 
                type="email" 
                placeholder={`Enter ${state.toLowerCase()} email`}
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
            
            <button className='bg-primary text-white w-full py-2 mt-3 rounded-md text-base hover:bg-primary/90 transition-colors'>
              Login
            </button>
            
            {/* <div className='text-center mt-3'>
              {state === 'Admin' ? (
                <p className='text-sm text-[#5E5E5E]'>
                  Stylist login? <span onClick={() => setState('Stylist')} className='text-primary underline cursor-pointer'>Click here</span>
                </p>
              ) : (
                <p className='text-sm text-[#5E5E5E]'>
                  Admin login? <span onClick={() => setState('Admin')} className='text-primary underline cursor-pointer'>Click here</span>
                </p>
              )}
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
