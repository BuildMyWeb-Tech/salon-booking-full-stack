import React, { useContext, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  return dashData && (
    <div className='m-5'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Salon Dashboard</h1>
        <p className='text-gray-600'>Welcome to your StyleStudio management portal</p>
      </div>

      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-sm'>
          <img className='w-14' src={assets.stylist_icon || assets.doctor_icon} alt="Stylist icon" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.stylists || dashData.doctors}</p>
            <p className='text-gray-400'>Stylists</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-sm'>
          <img className='w-14' src={assets.appointments_icon} alt="Booking icon" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Style Sessions</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-sm'>
          <img className='w-14' src={assets.clients_icon || assets.patients_icon} alt="Client icon" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.clients || dashData.patients}</p>
            <p className='text-gray-400'>Clients</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-sm'>
          <img className='w-14' src={assets.revenue_icon || assets.appointments_icon} alt="Revenue icon" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>${dashData.revenue || "0"}</p>
            <p className='text-gray-400'>Revenue</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8'>
        <div className='lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden'>
          <div className='flex items-center gap-2.5 px-4 py-4 border-b bg-gray-50'>
            <img src={assets.list_icon} alt="List icon" />
            <p className='font-semibold'>Latest Style Sessions</p>
          </div>

          <div className=''>
            {dashData.latestAppointments.slice(0, 5).map((item, index) => (
              <div className='flex items-center px-6 py-4 gap-4 hover:bg-gray-50 border-b last:border-b-0' key={index}>
                <img 
                  className='rounded-full w-12 h-12 object-cover border-2 border-gray-100' 
                  src={item.stylistData?.image || item.docData?.image} 
                  alt="Stylist profile" 
                />
                <div className='flex-1'>
                  <p className='text-gray-800 font-medium'>{item.stylistData?.name || item.docData?.name}</p>
                  <div className='flex items-center text-xs text-gray-500 mt-1'>
                    <span className='bg-primary/10 text-primary px-2 py-0.5 rounded-full'>{item.serviceType || 'Haircut & Styling'}</span>
                    <span className='mx-2'>•</span>
                    <span>{slotDateFormat(item.slotDate)}</span>
                    <span className='mx-2'>•</span>
                    <span>{item.slotTime || '10:00 AM'}</span>
                  </div>
                </div>
                <div className='flex items-center'>
                  {item.cancelled ? (
                    <p className='text-red-400 text-xs font-medium px-2 py-1 bg-red-50 rounded-full'>Cancelled</p>
                  ) : item.isCompleted ? (
                    <p className='text-green-500 text-xs font-medium px-2 py-1 bg-green-50 rounded-full'>Completed</p>
                  ) : (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors'
                    >
                      <img className='w-5' src={assets.cancel_icon} alt="Cancel booking" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {dashData.latestAppointments.length === 0 && (
              <div className='py-10 text-center text-gray-500'>
                <p>No bookings yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side stat panel */}
        <div className='bg-white rounded-lg shadow-sm p-5'>
          <h3 className='font-semibold mb-4'>Salon Performance</h3>
          
          <div className='space-y-4'>
            <div className='border-b pb-3'>
              <p className='text-gray-500 text-sm'>Popular Services</p>
              <div className='mt-2 space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm'>Haircut & Styling</span>
                  <span className='text-sm font-medium'>{dashData.popularServices?.haircut || '42%'}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm'>Color Treatment</span>
                  <span className='text-sm font-medium'>{dashData.popularServices?.color || '28%'}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm'>Hair Extensions</span>
                  <span className='text-sm font-medium'>{dashData.popularServices?.extensions || '15%'}</span>
                </div>
              </div>
            </div>
            
            <div className=''>
              <p className='text-gray-500 text-sm'>Top Stylists</p>
              <div className='mt-2 space-y-3'>
                {(dashData.topStylists || dashData.latestAppointments.slice(0, 3)).map((item, index) => (
                  <div className='flex items-center gap-2' key={index}>
                    <img 
                      className='w-8 h-8 rounded-full object-cover' 
                      src={item.image || item.stylistData?.image || item.docData?.image} 
                      alt="Stylist" 
                    />
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>{item.name || item.stylistData?.name || item.docData?.name}</p>
                      <p className='text-xs text-gray-500'>{item.specialty || 'Color Specialist'}</p>
                    </div>
                    <div className='text-xs font-medium'>{item.bookings || '24'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
