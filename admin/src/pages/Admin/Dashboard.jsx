import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { 
  Users, Calendar, UserCircle, IndianRupee, 
  Scissors, ArrowUpRight, Clock, CheckCircle, 
  XCircle, MoreHorizontal, RefreshCw, TrendingUp
} from 'lucide-react';

import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (aToken) {
      setIsLoading(true);
      getDashData().finally(() => {
        setIsLoading(false);
      });
    }
  }, [aToken]);

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return dashData && (
    <div className='p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2'>
          
          Salon Dashboard
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className='text-gray-600'>Welcome to your StyleStudio management portal</p>
          
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        {/* Stylists Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                Stylists
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {dashData.stylists || dashData.doctors || 0}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                Active team members
              </p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-lg bg-blue-50 text-blue-500">
              <Users size={22} className="sm:hidden" />
              <Users size={26} className="hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                Total Bookings
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {dashData.appointments || 0}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                All time appointments
              </p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-lg bg-purple-50 text-purple-500">
              <Calendar size={22} className="sm:hidden" />
              <Calendar size={26} className="hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                Customers
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {dashData.clients || dashData.patients || 0}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                Registered customers
              </p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-lg bg-green-50 text-green-500">
              <UserCircle size={22} className="sm:hidden" />
              <UserCircle size={26} className="hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                Revenue
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {formatCurrency(dashData.revenue || 0)}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                Total earnings
              </p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-lg bg-amber-50 text-amber-500">
              <IndianRupee size={22} className="sm:hidden" />
              <IndianRupee size={26} className="hidden sm:block" />
            </div>
          </div>
        </div>

      </div>



      {/* Recent Appointments Table */}
      <div className='mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <h2 className='font-semibold text-gray-800 flex items-center gap-2'>
            <Calendar className="h-5 w-5 text-primary" />
            Recent Bookings
          </h2>
          
          {/* <button className="flex items-center gap-1.5 text-sm text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <span>View All</span>
            <ArrowUpRight className="h-4 w-4" />
          </button> */}

          <Link
            to="/all-appointments"
            className="flex items-center gap-1.5 text-sm text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stylist</th>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th> */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashData.latestAppointments.slice(0, 5).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold uppercase">
                          {item.userData?.name?.charAt(0) || "C"}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">
                            {item.userData?.name || "Customer"}
                          </p>
                          <p className="text-xs text-gray-500">{item.userData?.email || "customer@example.com"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-9 w-9">
                          <img 
                            className="h-9 w-9 rounded-full object-cover border border-gray-200" 
                            src={item.stylistData?.image || item.docData?.image} 
                            alt="Stylist" 
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">
                            {item.stylistData?.name || item.docData?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.stylistData?.speciality || item.docData?.speciality || "Hair Stylist"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                        {item.serviceType || "Haircut & Styling"}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span>{slotDateFormat(item.slotDate)}, {item.slotTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.cancelled ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800">
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Cancelled
                        </span>
                      ) : item.isCompleted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-800">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          Upcoming
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!item.cancelled && !item.isCompleted && (
                        <button
                          onClick={() => cancelAppointment(item._id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                      {/* <button className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50 ml-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Calendar className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">No bookings yet</h3>
              <p className="text-gray-400 text-center max-w-md">
                When customers book appointments, they will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats - This section is hidden as requested */}
      {/* <div className='mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden'>
        <div className='px-6 py-4 border-b'>
          <h2 className='font-semibold text-gray-800'>Salon Performance</h2>
        </div>
        
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-3'>Popular Services</h3>
              <div className='space-y-3'>
                {[
                  { name: 'Haircut & Styling', value: '42%', color: 'bg-blue-500' },
                  { name: 'Color Treatment', value: '28%', color: 'bg-purple-500' },
                  { name: 'Hair Extensions', value: '15%', color: 'bg-pink-500' },
                  { name: 'Bridal Styling', value: '10%', color: 'bg-yellow-500' },
                ].map((service, idx) => (
                  <div key={idx}>
                    <div className='flex justify-between mb-1 items-center'>
                      <span className='text-sm text-gray-600'>{service.name}</span>
                      <span className='text-sm font-medium'>{service.value}</span>
                    </div>
                    <div className='w-full bg-gray-100 rounded-full h-2'>
                      <div className={`${service.color} h-2 rounded-full`} style={{ width: service.value }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-3'>Top Stylists</h3>
              <div className='space-y-4'>
                {(dashData.topStylists || dashData.latestAppointments.slice(0, 3)).map((item, index) => (
                  <div className='flex items-center' key={index}>
                    <img 
                      className='w-10 h-10 rounded-full object-cover border border-gray-200' 
                      src={item.image || item.stylistData?.image || item.docData?.image} 
                      alt="Stylist" 
                    />
                    <div className='ml-3 flex-1'>
                      <p className='text-sm font-medium text-gray-800'>{item.name || item.stylistData?.name || item.docData?.name}</p>
                      <p className='text-xs text-gray-500'>{item.specialty || 'Hair Stylist'}</p>
                    </div>
                    <div className='flex items-center'>
                      <span className='px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium'>{item.bookings || '24'} bookings</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
