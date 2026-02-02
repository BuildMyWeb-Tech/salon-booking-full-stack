import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  // Calculate today's earnings
  const getTodayEarnings = () => {
    if (!dashData || !dashData.latestAppointments) return 0
    
    const today = new Date().toDateString()
    return dashData.latestAppointments
      .filter(apt => {
        const aptDate = new Date(apt.slotDateTime || apt.slotDate).toDateString()
        return aptDate === today && (apt.isCompleted || apt.payment)
      })
      .reduce((sum, apt) => sum + (apt.amount || 0), 0)
  }

  // Calculate this month's earnings
  const getMonthEarnings = () => {
    if (!dashData || !dashData.latestAppointments) return 0
    
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return dashData.latestAppointments
      .filter(apt => {
        const aptDate = new Date(apt.slotDateTime || apt.slotDate)
        return aptDate.getMonth() === currentMonth && 
               aptDate.getFullYear() === currentYear &&
               (apt.isCompleted || apt.payment)
      })
      .reduce((sum, apt) => sum + (apt.amount || 0), 0)
  }

  // Get appointment counts by status
  const getAppointmentCounts = () => {
    if (!dashData || !dashData.latestAppointments) {
      return { pending: 0, completed: 0, cancelled: 0 }
    }

    const counts = {
      pending: 0,
      completed: 0,
      cancelled: 0
    }

    dashData.latestAppointments.forEach(apt => {
      if (apt.cancelled) counts.cancelled++
      else if (apt.isCompleted) counts.completed++
      else counts.pending++
    })

    return counts
  }

  const appointmentCounts = getAppointmentCounts()

  return dashData && (
    <div className='m-5'>

      {/* Dashboard Stats Cards */}
      <div className='flex flex-wrap gap-3'>
        
        {/* Today's Earnings Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{currency} {getTodayEarnings()}</p>
            <p className='text-gray-400'>Today's Earnings</p>
          </div>
        </div>

        {/* Monthly Earnings Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{currency} {getMonthEarnings()}</p>
            <p className='text-gray-400'>This Month</p>
          </div>
        </div>

        {/* Total Appointments Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Total Appointments</p>
          </div>
        </div>

        {/* Pending Appointments Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-yellow-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-yellow-600'>{appointmentCounts.pending}</p>
            <p className='text-gray-400'>Pending</p>
          </div>
        </div>

        {/* Completed Appointments Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-green-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.tick_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-green-600'>{appointmentCounts.completed}</p>
            <p className='text-gray-400'>Completed</p>
          </div>
        </div>

        {/* Cancelled Appointments Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-red-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.cancel_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-red-600'>{appointmentCounts.cancelled}</p>
            <p className='text-gray-400'>Cancelled</p>
          </div>
        </div>

        {/* Unique Clients Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Unique Clients</p>
          </div>
        </div>

      </div>

      {/* Latest Bookings Section */}
      <div className='bg-white mt-10 rounded-lg shadow-sm'>
        <div className='flex items-center gap-2.5 px-4 py-4 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='pt-4 border border-t-0 rounded-b'>
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.slice(0, 5).map((item, index) => (
              <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-50 transition-all' key={index}>
                <img 
                  className='rounded-full w-10 h-10 object-cover' 
                  src={item.userData?.image || assets.upload_area} 
                  alt="" 
                />
                <div className='flex-1 text-sm'>
                  <p className='text-gray-800 font-medium'>{item.userData?.name || 'N/A'}</p>
                  <p className='text-gray-600'>Booking on {slotDateFormat(item.slotDate)}</p>
                  <p className='text-gray-500 text-xs mt-1'>
                    {item.services && item.services.length > 0 
                      ? item.services.map(s => s.name).join(', ')
                      : item.service || 'Service'
                    }
                  </p>
                </div>
                <div className='text-right mr-4'>
                  <p className='font-semibold text-gray-700'>{currency}{item.amount}</p>
                  {item.paidAmount && item.paidAmount < item.amount && (
                    <p className='text-xs text-green-600'>
                      Paid: {currency}{item.paidAmount}
                    </p>
                  )}
                  {item.remainingAmount && item.remainingAmount > 0 && (
                    <p className='text-xs text-orange-600'>
                      Due: {currency}{item.remainingAmount}
                    </p>
                  )}
                </div>
                {item.cancelled ? (
                  <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                ) : item.isCompleted ? (
                  <p className='text-green-500 text-xs font-medium'>Completed</p>
                ) : (
                  <div className='flex gap-2'>
                    <img 
                      onClick={() => cancelAppointment(item._id)} 
                      className='w-10 cursor-pointer hover:scale-110 transition-all' 
                      src={assets.cancel_icon} 
                      alt="Cancel" 
                      title="Cancel Appointment"
                    />
                    <img 
                      onClick={() => completeAppointment(item._id)} 
                      className='w-10 cursor-pointer hover:scale-110 transition-all' 
                      src={assets.tick_icon} 
                      alt="Complete" 
                      title="Mark as Completed"
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <p>No appointments yet</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard