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
  RefreshCcw
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
  const [selectedQuickFilter, setSelectedQuickFilter] = useState(null)
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  
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
    
    setTempStartDate(start.toISOString().split('T')[0]);
    setTempEndDate(end.toISOString().split('T')[0]);
    setSelectedQuickFilter(filter);
  }
  
  // Apply calendar selection
  const applyCalendarFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowCalendarModal(false);
  }
  
  // Cancel calendar selection
  const cancelCalendarFilter = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowCalendarModal(false);
  }
  
  // Clear calendar dates
  const clearCalendarDates = () => {
    setTempStartDate('');
    setTempEndDate('');
    setSelectedQuickFilter(null);
  }
  
  // Open calendar modal
  const openCalendarModal = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowCalendarModal(true);
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
      
      // Next month days to fill grid
      const totalCells = Math.ceil(days.length / 7) * 7;
      const remainingDays = totalCells - days.length;
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
      if (!tempStartDate || !tempEndDate) return false;
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date >= start && date <= end;
    };
    
    const isDateSelected = (date) => {
      const start = tempStartDate ? new Date(tempStartDate) : null;
      const end = tempEndDate ? new Date(tempEndDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return (start && date.getTime() === start.getTime()) || (end && date.getTime() === end.getTime());
    };
    
    const handleDateClick = (date) => {
      const dateStr = date.toISOString().split('T')[0];
      
      if (!tempStartDate || (tempStartDate && tempEndDate)) {
        setTempStartDate(dateStr);
        setTempEndDate('');
        setSelectedQuickFilter(null);
      } else {
        const start = new Date(tempStartDate);
        if (date < start) {
          setTempStartDate(dateStr);
          setTempEndDate(tempStartDate);
        } else {
          setTempEndDate(dateStr);
        }
        setSelectedQuickFilter('custom');
      }
    };
    
    const renderCalendar = (monthDate) => {
      const days = getDaysInMonth(monthDate);
      const monthName = fullMonths[monthDate.getMonth()];
      const year = monthDate.getFullYear();
      
      return (
        <div className="flex-1">
          <div className="text-center font-bold text-gray-800 mb-4 text-base">
            {monthName} {year}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
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
                    aspect-square p-1 text-sm rounded-md transition-all font-medium
                    ${!dayObj.isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-800 hover:bg-blue-50'}
                    ${isSelected ? 'bg-blue-600 text-white font-bold hover:bg-blue-700' : ''}
                    ${isInRange && !isSelected ? 'bg-blue-100 text-blue-900' : ''}
                    ${isToday && !isSelected && !isInRange ? 'border-2 border-blue-600 font-bold' : ''}
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
    
    const formatDateRange = () => {
      if (!tempStartDate || !tempEndDate) return 'Select date range';
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);
      return `${start.getMonth() + 1}/${start.getDate()}/${start.getFullYear()} to ${end.getMonth() + 1}/${end.getDate()}/${end.getFullYear()}`;
    };
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowCalendarModal(false)}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Filters */}
          <div className="mb-5 pb-5 border-b">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Filters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => applyQuickFilter('today')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedQuickFilter === 'today' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => applyQuickFilter('yesterday')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedQuickFilter === 'yesterday' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => applyQuickFilter('last7')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedQuickFilter === 'last7' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => applyQuickFilter('last30')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedQuickFilter === 'last30' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => applyQuickFilter('thisYear')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedQuickFilter === 'thisYear' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                This Year
              </button>
              <button
                onClick={() => applyQuickFilter('lastYear')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedQuickFilter === 'lastYear' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Last Year
              </button>
            </div>
          </div>
          
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="text-sm sm:text-base text-gray-700 font-medium text-center">
              {formatDateRange()}
            </div>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Dual Calendar - Full Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {renderCalendar(leftMonth)}
            <div className="hidden md:block">
              {renderCalendar(rightMonth)}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-5 border-t">
            <button
              onClick={clearCalendarDates}
              className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors font-medium"
            >
              Clear Selection
            </button>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={cancelCalendarFilter}
                className="flex-1 sm:flex-none px-5 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={applyCalendarFilter}
                className="flex-1 sm:flex-none px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </motion.div>
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
          <XCircle size={12} />
          Cancelled
        </span>
      )
    } else if (appointment.isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
          <CheckCircle size={12} />
          Completed
        </span>
      )
    } else if (isPastAndUnhandled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold">
          <AlertCircle size={12} />
          Overdue
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
          <Calendar size={12} />
          Upcoming
        </span>
      )
    }
  }
  
  const PaymentStatusBadge = ({ appointment }) => {
    if (appointment.payment) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
          <DollarSign size={12} />
          Paid
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-semibold">
          <AlertTriangle size={12} />
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
    <div className='w-full max-w-[1600px] mx-auto p-3 sm:p-4 md:p-6'>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">Salon Appointments</h1>
              <p className="text-xs sm:text-sm text-gray-600">Manage all customer styling appointments</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={manualRefresh}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCcw size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </button>
              
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
                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters Bar */}
        <div className="p-3 sm:p-4 md:p-5 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col gap-3">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600 mr-1">Status:</span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button 
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    filterStatus === 'all' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterStatus('upcoming')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    filterStatus === 'upcoming' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Upcoming
                </button>
                <button 
                  onClick={() => setFilterStatus('completed')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    filterStatus === 'completed' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Completed
                </button>
                <button 
                  onClick={() => setFilterStatus('cancelled')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    filterStatus === 'cancelled' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
            
            {/* Search and Payment Filter Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by customer, stylist, service or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-9 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
              
              {/* Payment Filter and Date Range */}
              <div className="flex flex-wrap gap-2">
                {/* Payment Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Payment:</span>
                  <button 
                    onClick={() => setFilterPayment('all')}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      filterPayment === 'all' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilterPayment('paid')}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      filterPayment === 'paid' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Paid
                  </button>
                  <button 
                    onClick={() => setFilterPayment('unpaid')}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      filterPayment === 'unpaid' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Unpaid
                  </button>
                </div>
                
                {/* Calendar Date Range Picker */}
                <button
                  onClick={openCalendarModal}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Calendar size={16} />
                  <span className="hidden sm:inline">
                    {startDate && endDate 
                      ? `${new Date(startDate).getMonth() + 1}/${new Date(startDate).getDate()}/${new Date(startDate).getFullYear().toString().slice(-2)} - ${new Date(endDate).getMonth() + 1}/${new Date(endDate).getDate()}/${new Date(endDate).getFullYear().toString().slice(-2)}`
                      : 'Date Range'
                    }
                  </span>
                  <span className="sm:hidden">Date</span>
                </button>
                
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Table Container - Full scroll on all devices */}
        <div className="overflow-x-auto">
          {appointmentsLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="mt-4 font-medium">Loading appointments...</p>
            </div>
          ) : paginatedAppointments.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <Calendar size={48} className="text-gray-300 mb-4" />
              <p className="font-medium">No appointments found</p>
              <p className="text-sm mt-2">Try changing your filters or search term</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Customer
                  </th>
                  <th scope="col" className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Phone
                  </th>
                  <th scope="col" className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Stylist
                  </th>
                  <th scope="col" className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Service
                  </th>
                  <th scope="col" className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Date & Time
                  </th>
                  <th scope="col" className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th scope="col" className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Payment
                  </th>
                  <th scope="col" className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Price
                  </th>
                  <th scope="col" className="px-3 sm:px-4 md:px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAppointments.map((appointment, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {/* Customer */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9">
                          {appointment.userData?.image ? (
                            <img 
                              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover" 
                              src={appointment.userData.image} 
                              alt={appointment.userData.name}
                            />
                          ) : (
                            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs sm:text-sm">
                              {appointment.userData?.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {appointment.userData?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">
                        {appointment.userData?.phone || "N/A"}
                      </div>
                    </td>

                    {/* Stylist */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8">
                          {appointment.docData?.image ? (
                            <img 
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover" 
                              src={appointment.docData.image} 
                              alt={appointment.docData.name}
                            />
                          ) : (
                            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                              <Scissors size={12} className="sm:w-3.5 sm:h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {appointment.docData?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Service */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">
                        {appointment.service || appointment.docData?.specialty || appointment.docData?.speciality || "N/A"}
                      </div>
                    </td>
                    
                    {/* Date & Time */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {slotDateFormat(appointment.slotDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.slotTime || "N/A"}
                      </div>
                    </td>                  
                    
                    {/* Status */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <StatusBadge appointment={appointment} />
                    </td>
                    
                    {/* Payment Status */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <PaymentStatusBadge appointment={appointment} />
                    </td>
                    
                    {/* Price */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                      {currency}{appointment.amount || appointment.price || 0}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {!appointment.cancelled && (
                          appointment.isCompleted ? (
                            <button 
                              onClick={() => handleUndoCompleted(appointment._id)}
                              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                              title="Undo completion"
                            >
                              <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleMarkCompleted(appointment._id)}
                              className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-md transition-all"
                              title="Mark as completed"
                            >
                              <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                          )
                        )}
                        
                        {!appointment.cancelled && (
                          <button 
                            onClick={() => handleDeleteConfirmation(appointment)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Cancel appointment"
                          >
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
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
        
        {/* Footer - Stats and Pagination */}
        {paginatedAppointments.length > 0 && (
          <div className="px-3 sm:px-4 md:px-6 py-3 bg-white border-t border-gray-200">
            {/* Stats Bar */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-start sm:items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedAppointments.length)} of {sortedAppointments.length} total
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs">
                <span className="text-gray-600">
                  Upcoming: <span className="font-semibold text-purple-600">{localAppointments.filter(a => !a.isCompleted && !a.cancelled && !isAppointmentTimePast(a)).length}</span>
                </span>
                <span className="text-gray-600">
                  Overdue: <span className="font-semibold text-amber-600">{localAppointments.filter(a => !a.isCompleted && !a.cancelled && isAppointmentTimePast(a)).length}</span>
                </span>
                <span className="text-gray-600">
                  Completed: <span className="font-semibold text-green-600">{localAppointments.filter(a => a.isCompleted).length}</span>
                </span>
                <span className="text-gray-600">
                  Cancelled: <span className="font-semibold text-red-600">{localAppointments.filter(a => a.cancelled).length}</span>
                </span>
              </div>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Rows per page */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Rows</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              {/* Page Navigation */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1 sm:p-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="First page"
                >
                  <ChevronsLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 sm:p-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Previous page"
                >
                  <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[28px] sm:min-w-[36px] h-7 sm:h-9 rounded-md font-medium text-xs sm:text-sm transition-all ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                  className="p-1 sm:p-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Next page"
                >
                  <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1 sm:p-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Last page"
                >
                  <ChevronsRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg max-w-md w-full p-5 sm:p-6 shadow-xl"
            >
              <div className="mb-5 sm:mb-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-red-100 mb-4">
                  <AlertTriangle size={24} className="sm:w-7 sm:h-7 text-red-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Cancel Appointment</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Are you sure you want to cancel the appointment for <span className="font-semibold text-gray-900">{appointmentToDelete?.userData?.name}</span> on <span className="font-semibold text-gray-900">{slotDateFormat(appointmentToDelete?.slotDate)} at {appointmentToDelete?.slotTime}</span>?
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all font-medium text-xs sm:text-sm"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="flex-1 px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all font-medium text-xs sm:text-sm shadow-md"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendarModal && <CalendarModal />}
      </AnimatePresence>
    </div>
  );
};

export default AllAppointments;