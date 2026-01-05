import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  
  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])
  
  // Filter appointments based on status and search term
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'upcoming' && !appointment.isCompleted && !appointment.cancelled) ||
      (filterStatus === 'completed' && appointment.isCompleted) ||
      (filterStatus === 'cancelled' && appointment.cancelled)
    
    const searchString = (
      appointment.userData.name.toLowerCase() + ' ' +
      appointment.docData.name.toLowerCase() + ' ' +
      appointment.docData.speciality.toLowerCase()
    )
    
    const matchesSearch = searchTerm === '' || searchString.includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })
  
  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.slotDate.split('_').reverse().join('-'))
    const dateB = new Date(b.slotDate.split('_').reverse().join('-'))
    
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
      const apptDate = new Date(appointment.slotDate.split('_').reverse().join('-'))
      
      if (apptDate.toDateString() === today.toDateString()) {
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

  return (
    <div className='w-full max-w-7xl mx-auto p-4'>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Salon Appointments</h1>
          <p className="text-gray-500 mt-1">Manage all client styling appointments</p>
        </div>
        
        {/* Filters Row */}
        <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Left side - Filter tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0">
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
          
          {/* Right side - Search and sort */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search appointments..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
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
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Stylist
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
                    {/* Client */}
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
                            <span className="hidden sm:block">•</span>
                            <span className="hidden sm:block">{calculateAge(appointment.userData.dob)} years</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Service */}
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{appointment.docData.speciality}</div>
                      <div className="text-xs text-gray-500">
                        {appointment.serviceDetails || "Standard service"}
                      </div>
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
                    
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge appointment={appointment} />
                    </td>
                    
                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {currency}{appointment.amount}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {!appointment.cancelled && !appointment.isCompleted && (
                          <button 
                            onClick={() => cancelAppointment(appointment._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
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
      
      {/* Additional actions */}
      <div className="mt-5 flex justify-end gap-3">
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          Export Data
        </button>
        
        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
          Add New Appointment
        </button>
      </div>
    </div>
  )
}

export default AllAppointments
