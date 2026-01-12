import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { Trash2, Calendar, XCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-react'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])
  
  // Clear all filters
  const clearFilters = () => {
    setFilterStatus('all')
    setSearchTerm('')
    setStartDate('')
    setEndDate('')
    setSortBy('date-desc')
  }
  
  // Helper function to parse date strings in DD_MM_YYYY format
  const parseDateString = (dateStr) => {
    // Check if date is in DD_MM_YYYY format
    if (dateStr.includes('_')) {
      const [day, month, year] = dateStr.split('_').map(Number);
      // Month is 0-indexed in JavaScript Date
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  }
  
  // Filter appointments based on status, search term, and date range
  const filteredAppointments = appointments.filter(appointment => {
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'upcoming' && !appointment.isCompleted && !appointment.cancelled) ||
      (filterStatus === 'completed' && appointment.isCompleted) ||
      (filterStatus === 'cancelled' && appointment.cancelled)
    
    // Search filter
    const searchString = (
      appointment.userData.name.toLowerCase() + ' ' +
      appointment.docData.name.toLowerCase() + ' ' +
      appointment.docData.speciality.toLowerCase()
    )
    
    const matchesSearch = searchTerm === '' || searchString.includes(searchTerm.toLowerCase())
    
    // Date filter
    let matchesDateRange = true
    if (startDate || endDate) {
      // Parse the appointment date correctly
      const appointmentDate = parseDateString(appointment.slotDate);
      
      if (startDate && endDate) {
        // Create start date at beginning of day (00:00:00)
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        // Create end date at end of day (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        // Include both start and end dates in the range
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
    
    return matchesStatus && matchesSearch && matchesDateRange
  })
  
  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = parseDateString(a.slotDate);
    const dateB = parseDateString(b.slotDate);
    
    if (sortBy === 'date-asc') return dateA - dateB
    if (sortBy === 'date-desc') return dateB - dateA
    if (sortBy === 'price-asc') return a.amount - b.amount
    if (sortBy === 'price-desc') return b.amount - a.amount
    return 0
  })
  
  // Status badge component
  const StatusBadge = ({ appointment }) => {
    if (appointment.cancelled) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          Cancelled
        </span>
      )
    } else if (appointment.isCompleted) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Completed
        </span>
      )
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      const apptDate = parseDateString(appointment.slotDate);
      apptDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      if (apptDate.getTime() === today.getTime()) {
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            Today
          </span>
        )
      } else {
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            Upcoming
          </span>
        )
      }
    }
  }

  // Format date for Excel export (from DD_MM_YYYY to a more readable format)
  const formatDateForExport = (dateStr) => {
    if (!dateStr || !dateStr.includes('_')) return dateStr;
    const [day, month, year] = dateStr.split('_');
    return `${day}/${month}/${year}`;
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-4'>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Salon Appointments</h1>
            <p className="text-gray-500 mt-1">Manage all customer styling appointments</p>
          </div>
          
          <button
            onClick={() => {
              if (!sortedAppointments || sortedAppointments.length === 0) {
                alert('No appointment data available')
                return
              }

              // Convert appointments to worksheet with formatted data
              const worksheet = XLSX.utils.json_to_sheet(
                sortedAppointments.map((item, index) => ({
                  'S.No': index + 1,
                  'Customer Name': item.userData?.name || '',
                  'Stylist Name': item.docData?.name || '',
                  'Service': item.docData?.speciality || '',
                  'Date': formatDateForExport(item.slotDate) || '',
                  'Time': item.slotTime || '',
                  'Status': item.cancelled ? 'Cancelled' : 
                           item.isCompleted ? 'Completed' : 'Upcoming',
                  'Amount': item.amount ? `${currency}${item.amount}` : '0',
                  'Payment Status': item.payment ? 'Paid' : 'Pending'
                }))
              )

              // Create workbook
              const workbook = XLSX.utils.book_new()
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments')

              // Export file
              XLSX.writeFile(workbook, 'Salon_Appointments.xlsx')
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export Excel
          </button>

        </div>
        
        {/* Filters Row */}
        <div className="p-4 border-b bg-gray-50 flex flex-col gap-4">
          {/* Status and Search */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Left side - Filter tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  filterStatus === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Appointments
              </button>
              <button 
                onClick={() => setFilterStatus('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  filterStatus === 'upcoming' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  filterStatus === 'completed' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Completed
              </button>
              <button 
                onClick={() => setFilterStatus('cancelled')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  filterStatus === 'cancelled' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancelled
              </button>
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Search appointments..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-9 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          </div>
          
          {/* Date range and sorting */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-500" />
                <span className="text-sm text-gray-600 whitespace-nowrap">Date Range:</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded-lg p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-gray-500">to</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded-lg p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              {(startDate || endDate || searchTerm || filterStatus !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
                >
                  <XCircle size={16} />
                  Clear filters
                </button>
              )}
            </div>
            
            <div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Table Container */}
        <div className="overflow-x-auto">
          {sortedAppointments.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No appointments found</p>
              <p className="text-sm mt-2">Try changing your filters or search term</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Stylist
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAppointments.map((appointment, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    
                    {/* customer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {appointment.userData.image ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={appointment.userData.image} 
                              alt={appointment.userData.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {appointment.userData.name.charAt(0)}
                            </div>
                          )}
                          
                          <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                            appointment.cancelled ? 'bg-red-400' : 
                            appointment.isCompleted ? 'bg-green-400' : 'bg-blue-400'
                          }`}></span>
                        </div>
                        
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.userData.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>{appointment.userData.phone || "No phone"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stylist */}
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img 
                            className="h-8 w-8 rounded-full object-cover border border-gray-200" 
                            src={appointment.docData.image} 
                            alt={appointment.docData.name}
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.docData.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Service */}
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{appointment.docData.speciality}</div>
                    </td>
                    
                    {/* Date & Time */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {slotDateFormat(appointment.slotDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.slotTime}
                      </div>
                    </td>                  
                    
                    
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge appointment={appointment} />
                    </td>
                    
                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {currency}{appointment.amount}
                      {appointment.payment && (
                        <span className="ml-2 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                          Paid
                        </span>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!appointment.cancelled && !appointment.isCompleted && (
                        <button 
                          onClick={() => cancelAppointment(appointment._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Cancel appointment"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer with counts */}
        <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row gap-3 justify-between items-center text-sm text-gray-500">
          <div>
            Showing {sortedAppointments.length} of {appointments.length} total appointments
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-purple-100 rounded-full"></span>
              <span>Upcoming: {appointments.filter(a => !a.isCompleted && !a.cancelled).length}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-100 rounded-full"></span>
              <span>Completed: {appointments.filter(a => a.isCompleted).length}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-100 rounded-full"></span>
              <span>Cancelled: {appointments.filter(a => a.cancelled).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllAppointments
