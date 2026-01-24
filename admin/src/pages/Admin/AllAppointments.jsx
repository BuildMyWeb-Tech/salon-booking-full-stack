import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { 
  Trash2, 
  Calendar, 
  XCircle, 
  Download, 
  Search,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  DollarSign,
  X,
  Check,
  AlertCircle,
  Filter,
  Scissors,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarRange,
  Plus
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { AnimatePresence, motion } from 'framer-motion'

const AllAppointments = () => {
  const { 
    aToken, 
    appointments, 
    appointmentsLoading, 
    cancelAppointment, 
    getAllAppointments, 
    markAppointmentCompleted, 
    markAppointmentIncomplete 
  } = useContext(AdminContext)
  
  const { currency } = useContext(AppContext)
  
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState(null)
  const [localAppointments, setLocalAppointments] = useState([])
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Calendar modal state
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [calendarView, setCalendarView] = useState('left') // 'left' or 'right' month
  const [selectedQuickFilter, setSelectedQuickFilter] = useState('last7')
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllAppointments();
      } catch (error) {
        console.error('Error in appointment fetch:', error);
      }
    };
    
    if (aToken) {
      fetchData();
    }
  }, [aToken]);
  
  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPayment, searchTerm, startDate, endDate]);
  
  // Clear all filters
  const clearFilters = () => {
    setFilterStatus('all')
    setFilterPayment('all')
    setSearchTerm('')
    setStartDate('')
    setEndDate('')
    setSortBy('date-desc')
    setSelectedQuickFilter(null)
  }
  
  // Quick date filter functions
  const applyQuickFilter = (filter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let start = new Date(today);
    let end = new Date(today);
    
    switch(filter) {
      case 'today':
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case 'last7':
        start.setDate(start.getDate() - 6);
        break;
      case 'last30':
        start.setDate(start.getDate() - 29);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        return;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setSelectedQuickFilter(filter);
    setShowCalendarModal(false);
  }
  
  // Calendar component
  const CalendarModal = () => {
    const today = new Date();
    const [leftMonth, setLeftMonth] = useState(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    const [rightMonth, setRightMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Previous month days
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonthLastDay - i,
          isCurrentMonth: false,
          date: new Date(year, month - 1, prevMonthLastDay - i)
        });
      }
      
      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          day: i,
          isCurrentMonth: true,
          date: new Date(year, month, i)
        });
      }
      
      // Next month days
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
          date: new Date(year, month + 1, i)
        });
      }
      
      return days;
    };
    
    const navigateMonth = (direction) => {
      if (direction === 'prev') {
        setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() - 1, 1));
        setRightMonth(new Date(rightMonth.getFullYear(), rightMonth.getMonth() - 1, 1));
      } else {
        setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1));
        setRightMonth(new Date(rightMonth.getFullYear(), rightMonth.getMonth() + 1, 1));
      }
    };
    
    const isDateInRange = (date) => {
      if (!startDate || !endDate) return false;
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date >= start && date <= end;
    };
    
    const isDateSelected = (date) => {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return (start && date.getTime() === start.getTime()) || (end && date.getTime() === end.getTime());
    };
    
    const handleDateClick = (date) => {
      const dateStr = date.toISOString().split('T')[0];
      
      if (!startDate || (startDate && endDate)) {
        setStartDate(dateStr);
        setEndDate('');
        setSelectedQuickFilter(null);
      } else {
        const start = new Date(startDate);
        if (date < start) {
          setStartDate(dateStr);
          setEndDate(startDate);
        } else {
          setEndDate(dateStr);
        }
        setSelectedQuickFilter('custom');
      }
    };
    
    const renderCalendar = (monthDate) => {
      const days = getDaysInMonth(monthDate);
      const monthName = months[monthDate.getMonth()];
      const year = monthDate.getFullYear();
      
      return (
        <div className="flex-1 min-w-0">
          <div className="text-center font-semibold text-gray-700 mb-3 text-sm">
            {monthName} {year}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {days.map((dayObj, idx) => {
              const isInRange = isDateInRange(dayObj.date);
              const isSelected = isDateSelected(dayObj.date);
              const isToday = dayObj.date.toDateString() === today.toDateString();
              
              return (
                <button
                  key={idx}
                  onClick={() => dayObj.isCurrentMonth && handleDateClick(dayObj.date)}
                  disabled={!dayObj.isCurrentMonth}
                  className={`
                    aspect-square p-1 text-xs rounded-md transition-all
                    ${!dayObj.isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
                    ${isSelected ? 'bg-indigo-600 text-white font-semibold hover:bg-indigo-700' : ''}
                    ${isInRange && !isSelected ? 'bg-indigo-100 text-indigo-900' : ''}
                    ${isToday && !isSelected ? 'border-2 border-indigo-600' : ''}
                  `}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>
        </div>
      );
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-5 z-50 w-full max-w-[680px]"
      >
        {/* Quick Filters */}
        <div className="mb-4 pb-4 border-b">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => applyQuickFilter('today')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedQuickFilter === 'today' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => applyQuickFilter('yesterday')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedQuickFilter === 'yesterday' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => applyQuickFilter('last7')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedQuickFilter === 'last7' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => applyQuickFilter('last30')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedQuickFilter === 'last30' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => applyQuickFilter('thisYear')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedQuickFilter === 'thisYear' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => applyQuickFilter('lastYear')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedQuickFilter === 'lastYear' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Last Year
            </button>
          </div>
        </div>
        
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-sm text-gray-600 font-medium">
            {startDate && endDate ? `${startDate} - ${endDate}` : 'Select date range'}
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Dual Calendar */}
        <div className="flex gap-4 mb-4">
          {renderCalendar(leftMonth)}
          <div className="hidden sm:block">
            {renderCalendar(rightMonth)}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSelectedQuickFilter(null);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowCalendarModal(false)}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </motion.div>
    );
  };
  
  const slotDateFormat = (slotDate) => {
    if (!slotDate) return 'Invalid Date';
    
    if (slotDate.includes('_')) {
      const dateArray = slotDate.split('_');
      if (dateArray.length !== 3) return 'Invalid Date';
      
      const day = dateArray[0];
      const month = Number(dateArray[1]) - 1;
      const year = dateArray[2];
      
      if (month < 0 || month > 11) return 'Invalid Date';
      
      return `${day} ${months[month]} ${year}`;
    }
    
    try {
      const dateObj = new Date(slotDate);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      
      const day = dateObj.getDate();
      const month = dateObj.getMonth();
      const year = dateObj.getFullYear();
      
      return `${day} ${months[month]} ${year}`;
    } catch (error) {
      console.error('Date format error:', error);
      return 'Invalid Date';
    }
  };
  
  const parseDateString = (dateStr) => {
    if (!dateStr) return new Date(NaN);
    
    if (dateStr.includes('_')) {
      const [day, month, year] = dateStr.split('_').map(Number);
      return new Date(year, month - 1, day);
    }
    
    return new Date(dateStr);
  };
  
  const isAppointmentTimePast = (appointment) => {
    if (!appointment || !appointment.slotDate || !appointment.slotTime) return false;
    
    const appointmentDate = parseDateString(appointment.slotDate);
    
    const timeParts = appointment.slotTime.match(/(\d+):(\d+)\s*([APap][Mm])/);
    if (timeParts) {
      let [, hours, minutes, period] = timeParts;
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      
      if (period.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      
      appointmentDate.setHours(hours, minutes);
      appointmentDate.setMinutes(appointmentDate.getMinutes() + 30);
      
      return new Date() > appointmentDate;
    }
    
    return false;
  }
  
  const filteredAppointments = localAppointments.filter(appointment => {
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'upcoming' && !appointment.isCompleted && !appointment.cancelled) ||
      (filterStatus === 'completed' && appointment.isCompleted && !appointment.cancelled) ||
      (filterStatus === 'cancelled' && appointment.cancelled);
    
    const matchesPayment = 
      filterPayment === 'all' ||
      (filterPayment === 'paid' && appointment.payment) ||
      (filterPayment === 'unpaid' && !appointment.payment);
    
    const searchString = [
      appointment.userData?.name || '',
      appointment.userData?.phone || '',
      appointment.docData?.name || '',
      appointment.service || '',
      appointment.docData?.specialty || appointment.docData?.speciality || ''
    ].map(s => s.toLowerCase()).join(' ');
    
    const matchesSearch = !searchTerm || searchString.includes(searchTerm.toLowerCase());
    
    let matchesDateRange = true;
    if (startDate || endDate) {
      const appointmentDate = parseDateString(appointment.slotDate);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        matchesDateRange = appointmentDate >= start && appointmentDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDateRange = appointmentDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDateRange = appointmentDate <= end;
      }
    }
    
    return matchesStatus && matchesPayment && matchesSearch && matchesDateRange;
  });
  
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = parseDateString(a.slotDate);
    const dateB = parseDateString(b.slotDate);
    
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    
    if (sortBy === 'date-asc') return dateA - dateB;
    if (sortBy === 'date-desc') return dateB - dateA;
    if (sortBy === 'price-asc') return (a.amount || 0) - (b.amount || 0);
    if (sortBy === 'price-desc') return (b.amount || 0) - (a.amount || 0);
    return 0;
  });
  
  // Pagination logic
  const totalPages = Math.ceil(sortedAppointments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAppointments = sortedAppointments.slice(startIndex, endIndex);
  
  const handleMarkCompleted = (id) => {
    setLocalAppointments(prev => 
      prev.map(app => 
        app._id === id ? {...app, isCompleted: true} : app
      )
    );
    setFilterStatus('completed');
    markAppointmentCompleted(id);
  }
  
  const handleUndoCompleted = (id) => {
    setLocalAppointments(prev => 
      prev.map(app => 
        app._id === id ? {...app, isCompleted: false} : app
      )
    );
    setFilterStatus('upcoming');
    markAppointmentIncomplete(id);
  }
  
  const handleDeleteConfirmation = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  }
  
  const handleDeleteConfirmed = () => {
    if (appointmentToDelete) {
      setLocalAppointments(prev => 
        prev.map(app => 
          app._id === appointmentToDelete._id ? {...app, cancelled: true} : app
        )
      );
      setFilterStatus('cancelled');
      cancelAppointment(appointmentToDelete._id);
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    }
  }
  
  const StatusBadge = ({ appointment }) => {
    const isPastAndUnhandled = !appointment.isCompleted && !appointment.cancelled && isAppointmentTimePast(appointment);
    
    if (appointment.cancelled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
          <XCircle size={14} />
          Cancelled
        </span>
      )
    } else if (appointment.isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
          <CheckCircle size={14} />
          Completed
        </span>
      )
    } else if (isPastAndUnhandled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
          <AlertCircle size={14} />
          Overdue
        </span>
      )
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const apptDate = parseDateString(appointment.slotDate);
      apptDate.setHours(0, 0, 0, 0);
      
      if (apptDate.getTime() === today.getTime()) {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
            <Calendar size={14} />
            Today
          </span>
        )
      } else {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
            <Calendar size={14} />
            Scheduled
          </span>
        )
      }
    }
  }
  
  const PaymentStatusBadge = ({ appointment }) => {
    if (appointment.payment) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
          <CheckCircle size={14} />
          Paid
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold border border-orange-200">
          <AlertTriangle size={14} />
          Unpaid
        </span>
      )
    }
  }

  const formatDateForExport = (dateStr) => {
    return slotDateFormat(dateStr) || dateStr;
  }

  const manualRefresh = () => {
    getAllAppointments();
  };

  return (
    <div className='w-full max-w-[1400px] mx-auto p-3 sm:p-6'>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Appointment</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage all customer styling appointments</p>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (!sortedAppointments || sortedAppointments.length === 0) {
                    alert('No appointment data available')
                    return
                  }

                  const worksheet = XLSX.utils.json_to_sheet(
                    sortedAppointments.map((item, index) => ({
                      'S.No': index + 1,
                      'Customer Name': item.userData?.name || '',
                      'Phone Number': item.userData?.phone || '',
                      'Stylist Name': item.docData?.name || '',
                      'Service': item.service || item.docData?.specialty || item.docData?.speciality || '',
                      'Date': formatDateForExport(item.slotDate) || '',
                      'Time': item.slotTime || '',
                      'Status': item.cancelled ? 'Cancelled' : 
                               item.isCompleted ? 'Completed' : 
                               isAppointmentTimePast(item) ? 'Overdue' : 'Upcoming',
                      'Payment Status': item.payment ? 'Paid' : 'Unpaid',
                      'Amount': item.amount ? `${currency}${item.amount}` : '0'
                    }))
                  )

                  const workbook = XLSX.utils.book_new()
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments')
                  XLSX.writeFile(workbook, 'Salon_Appointments.xlsx')
                }}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all flex items-center gap-2 shadow-sm"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center gap-2 shadow-md"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Appointment</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full shadow-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={20} />
                </button>
              )}
            </div>
          </div>
          
          {/* Date Range and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            {/* Calendar Date Picker */}
            <div className="relative flex-1 w-full lg:max-w-xs">
              <button
                onClick={() => setShowCalendarModal(!showCalendarModal)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <CalendarRange size={18} className="text-gray-500" />
                <span className="flex-1 text-left">
                  {startDate && endDate 
                    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                    : selectedQuickFilter 
                      ? selectedQuickFilter.charAt(0).toUpperCase() + selectedQuickFilter.slice(1).replace(/([A-Z])/g, ' $1')
                      : 'Select Date Range'
                  }
                </span>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              
              <AnimatePresence>
                {showCalendarModal && <CalendarModal />}
              </AnimatePresence>
            </div>
            
            {/* Filters Button */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button
                onClick={() => setFilterStatus(filterStatus === 'all' ? 'upcoming' : 'all')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${
                  filterStatus !== 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={18} />
                Filters
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
              >
                <option value="date-desc">Sort By : Recent</option>
                <option value="date-asc">Sort By : Oldest</option>
                <option value="price-desc">Sort By : Price ↓</option>
                <option value="price-asc">Sort By : Price ↑</option>
              </select>
              
              {(startDate || endDate || searchTerm || filterStatus !== 'all' || filterPayment !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm"
                >
                  <XCircle size={18} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Table Container */}
        <div className="overflow-x-auto">
          {appointmentsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <div className="animate-spin h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
              <p className="mt-4 font-medium">Loading appointments...</p>
            </div>
          ) : paginatedAppointments.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <Calendar size={64} className="text-gray-300 mb-4" />
              <p className="text-lg font-medium">No appointments found</p>
              <p className="text-sm mt-2">Try changing your filters or search term</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    Stylist
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                    Service Type
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedAppointments.map((appointment, index) => (
                  <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                    {/* Date & Time */}
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200">
                            <Calendar size={24} className="text-indigo-600" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {slotDateFormat(appointment.slotDate)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {appointment.slotTime || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stylist */}
                    <td className="px-4 sm:px-6 py-5 hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          {appointment.docData?.image ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md" 
                              src={appointment.docData.image} 
                              alt={appointment.docData.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center border border-purple-200">
                              <Scissors size={18} className="text-purple-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.docData?.name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.userData?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Service */}
                    <td className="px-4 sm:px-6 py-5 hidden lg:table-cell">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.service || appointment.docData?.specialty || appointment.docData?.speciality || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {currency}{appointment.amount || appointment.price || 0}
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <StatusBadge appointment={appointment} />
                        <PaymentStatusBadge appointment={appointment} />
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 sm:px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!appointment.cancelled && (
                          appointment.isCompleted ? (
                            <button 
                              onClick={() => handleUndoCompleted(appointment._id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Undo completion"
                            >
                              <RotateCcw size={20} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleMarkCompleted(appointment._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="Mark as completed"
                            >
                              <CheckCircle size={20} />
                            </button>
                          )
                        )}
                        
                        {!appointment.cancelled && (
                          <button 
                            onClick={() => handleDeleteConfirmation(appointment)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancel appointment"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Footer */}
        {paginatedAppointments.length > 0 && (
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Rows per page */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">Row Per Page</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">Entries</span>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsLeft size={20} />
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[40px] h-10 rounded-lg font-medium text-sm transition-all ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="mb-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertTriangle size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Appointment</h3>
                <p className="text-gray-600">
                  Are you sure you want to cancel the appointment for <span className="font-semibold text-gray-900">{appointmentToDelete?.userData?.name}</span> on <span className="font-semibold text-gray-900">{slotDateFormat(appointmentToDelete?.slotDate)} at {appointmentToDelete?.slotTime}</span>?
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  <span>Keep It</span>
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check size={18} />
                  <span>Yes, Cancel</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllAppointments;