import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { 
  Users, Calendar, UserCircle, IndianRupee, 
  Scissors, ArrowUpRight, Clock, CheckCircle, 
  XCircle, MoreHorizontal, RefreshCw, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData, getAllAppointments, appointments } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [servicePopularity, setServicePopularity] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [stylistPerformance, setStylistPerformance] = useState([]);

  useEffect(() => {
    if (aToken) {
      setIsLoading(true);
      
      Promise.all([
        getDashData(),
        getAllAppointments()
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [aToken]);
  
  // Process appointments data for charts when appointments or dashData changes
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      processBookingTrends();
      processServicePopularity();
      processRevenueData();
      processStylistPerformance();
    }
  }, [appointments, dashData]);

  // API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});
        
        // Calculate total revenue from all appointments
        let totalRevenue = 0;
        appointments.forEach(appointment => {
            if (appointment.amount && !appointment.cancelled) {
                totalRevenue += Number(appointment.amount);
            }
        });

        // Get today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaysAppointments = appointments.filter(app => {
            const appDate = new Date(app.date || app.slotDate || app.createdAt);
            return appDate >= today && appDate < tomorrow;
        });

        // Get this month's appointments
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        
        const thisMonthAppointments = appointments.filter(app => {
            const appDate = new Date(app.date || app.slotDate || app.createdAt);
            return appDate >= firstDayOfMonth && appDate < firstDayOfNextMonth;
        });

        const dashData = {
            doctors: doctors.length,
            stylists: doctors.length, // Adding this for frontend compatibility
            appointments: appointments.length,
            patients: users.length,
            clients: users.length, // Adding this for frontend compatibility
            todaysAppointments: todaysAppointments.length,
            thisMonthAppointments: thisMonthAppointments.length,
            revenue: totalRevenue,
            latestAppointments: appointments.slice(-5).reverse() // Get latest 5 appointments
        };

        res.json({ success: true, dashData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

  // Calculate booking trends (appointments per day)
  const processBookingTrends = () => {
    // Create a map to count bookings by date
    const bookingsByDate = {};
    
    // Get last 30 days
    const dates = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      bookingsByDate[dateStr] = 0;
      dates.push(dateStr);
    }
    
    // Count appointments per day
    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date || appointment.slotDate);
      const dateStr = appointmentDate.toISOString().split('T')[0];
      
      if (bookingsByDate[dateStr] !== undefined) {
        bookingsByDate[dateStr]++;
      }
    });
    
    // Convert to array format for chart
    const chartData = dates.map(date => ({
      date: date.slice(5), // Just month and day (MM-DD)
      bookings: bookingsByDate[date]
    }));
    
    setBookingTrends(chartData);
  };

  // Calculate service popularity
  const processServicePopularity = () => {
    const serviceCount = {};
    
    appointments.forEach(appointment => {
      if (appointment.services && Array.isArray(appointment.services)) {
        appointment.services.forEach(service => {
          if (service.name) {
            if (!serviceCount[service.name]) {
              serviceCount[service.name] = 0;
            }
            serviceCount[service.name]++;
          }
        });
      } else if (appointment.service) {
        // Handle legacy format
        const serviceName = appointment.service;
        if (!serviceCount[serviceName]) {
          serviceCount[serviceName] = 0;
        }
        serviceCount[serviceName]++;
      }
    });
    
    // Convert to array and sort by popularity
    const serviceData = Object.entries(serviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 services
    
    setServicePopularity(serviceData);
  };

  

  // Calculate revenue data
  const processRevenueData = () => {
    const revenueByMonth = {};
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize with last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
      revenueByMonth[monthKey] = {
        name: monthNames[month.getMonth()],
        revenue: 0,
        completedRevenue: 0
      };
    }
    
    // Calculate revenue
    appointments.forEach(appointment => {
      if (appointment.amount) {
        const appointmentDate = new Date(appointment.date || appointment.slotDate);
        const monthKey = `${appointmentDate.getFullYear()}-${appointmentDate.getMonth()}`;
        
        if (revenueByMonth[monthKey]) {
          revenueByMonth[monthKey].revenue += appointment.amount;
          
          if (appointment.isCompleted) {
            revenueByMonth[monthKey].completedRevenue += appointment.amount;
          }
        }
      }
    });
    
    // Convert to array format for chart
    setRevenueData(Object.values(revenueByMonth));
  };

  // Calculate total revenue from appointments
const calculateTotalRevenue = () => {
  if (!appointments || appointments.length === 0) return 0;
  
  return appointments.reduce((total, appointment) => {
    // Only count non-cancelled appointments
    if (appointment.amount && !appointment.cancelled) {
      return total + Number(appointment.amount);
    }
    return total;
  }, 0);
};

// Count today's appointments
const countTodayAppointments = () => {
  if (!appointments || appointments.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return appointments.filter(app => {
    const appDate = new Date(app.date || app.slotDate || app.createdAt);
    return appDate >= today && appDate < tomorrow && !app.cancelled;
  }).length;
};

// Calculate monthly revenue
const calculateMonthlyRevenue = () => {
  if (!appointments || appointments.length === 0) return 0;
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  return appointments.reduce((total, appointment) => {
    if (appointment.amount && !appointment.cancelled) {
      const appDate = new Date(appointment.date || appointment.slotDate || appointment.createdAt);
      if (appDate >= firstDayOfMonth && appDate < firstDayOfNextMonth) {
        return total + Number(appointment.amount);
      }
    }
    return total;
  }, 0);
};

// Calculate appointment completion rate
const calculateCompletionRate = () => {
  if (!appointments || appointments.length === 0) return 0;
  
  const completedCount = appointments.filter(app => 
    app.isCompleted && !app.cancelled
  ).length;
  
  const totalValidCount = appointments.filter(app => 
    !app.cancelled
  ).length;
  
  return totalValidCount ? Math.round((completedCount / totalValidCount) * 100) : 0;
};

  // Calculate stylist performance
  const processStylistPerformance = () => {
    const stylistStats = {};
    
    appointments.forEach(appointment => {
      const stylistId = appointment.docId || appointment.doctorId;
      const stylistName = appointment.docData?.name || "Unknown";
      
      if (!stylistStats[stylistId]) {
        stylistStats[stylistId] = {
          name: stylistName,
          appointments: 0,
          completed: 0,
          revenue: 0
        };
      }
      
      stylistStats[stylistId].appointments++;
      
      if (appointment.isCompleted) {
        stylistStats[stylistId].completed++;
      }
      
      if (appointment.amount) {
        stylistStats[stylistId].revenue += appointment.amount;
      }
    });
    
    // Convert to array and sort by appointments
    const performanceData = Object.values(stylistStats)
      .map(stylist => ({
        ...stylist,
        completionRate: stylist.appointments > 0 
          ? Math.round((stylist.completed / stylist.appointments) * 100) 
          : 0
      }))
      .sort((a, b) => b.appointments - a.appointments);
    
    setStylistPerformance(performanceData);
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
          <button 
            onClick={() => {
              setIsLoading(true);
              Promise.all([getDashData(), getAllAppointments()])
                .finally(() => setIsLoading(false));
            }}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary"
          >
            <RefreshCw size={14} />
            <span>Refresh Data</span>
          </button>
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

  {/* Revenue Card - Updated for Clarity */}
  <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-500">
          Revenue
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
          {formatCurrency(dashData.revenue || calculateTotalRevenue() || 0)}
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

{/* Additional Stats Cards - for better insight */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-5">
  {/* Today's Appointments */}
  <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-500">
          Today's Bookings
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
          {dashData.todaysAppointments || countTodayAppointments() || 0}
        </p>
        <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
          Appointments scheduled for today
        </p>
      </div>

      <div className="p-2.5 sm:p-3 rounded-lg bg-green-50 text-green-500">
        <Calendar size={22} className="sm:hidden" />
        <Calendar size={26} className="hidden sm:block" />
      </div>
    </div>
  </div>

  {/* Monthly Revenue */}
  <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-500">
          This Month's Revenue
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
          {formatCurrency(calculateMonthlyRevenue() || 0)}
        </p>
        <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
          Revenue for {new Date().toLocaleString('default', { month: 'long' })}
        </p>
      </div>

      <div className="p-2.5 sm:p-3 rounded-lg bg-purple-50 text-purple-500">
        <IndianRupee size={22} className="sm:hidden" />
        <IndianRupee size={26} className="hidden sm:block" />
      </div>
    </div>
  </div>
  
  {/* Completion Rate */}
  <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-500">
          Completion Rate
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
          {calculateCompletionRate()}%
        </p>
        <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
          Appointments completed successfully
        </p>
      </div>

      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-50 text-blue-500">
        <CheckCircle size={22} className="sm:hidden" />
        <CheckCircle size={26} className="hidden sm:block" />
      </div>
    </div>
  </div>
</div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Booking Trends Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2 text-blue-500" />
            Booking Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={bookingTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Popularity */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Scissors size={20} className="mr-2 text-green-500" />
            Service Popularity
          </h3>
          <div className="h-80 flex">
            <ResponsiveContainer width="60%" height="100%">
              <BarChart
                data={servicePopularity}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            
            <ResponsiveContainer width="40%" height="100%">
              <PieChart>
                <Pie
                  data={servicePopularity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {servicePopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Revenue Analytics */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <IndianRupee size={20} className="mr-2 text-amber-500" />
            Revenue Analytics
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Total Revenue" />
                <Bar dataKey="completedRevenue" fill="#82ca9d" name="Completed Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Stylist Performance */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users size={20} className="mr-2 text-blue-500" />
            Stylist Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stylistPerformance}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#8884d8" name="Total Appointments" />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
