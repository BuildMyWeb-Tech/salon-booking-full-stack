import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  return (
    <div className='w-full max-w-6xl m-5'>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
        
        {/* Table Header */}
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b bg-gray-50 sticky top-0'>
          <p className='font-medium'>#</p>
          <p className='font-medium'>Client</p>
          <p className='font-medium'>Payment</p>
          <p className='font-medium'>Age</p>
          <p className='font-medium'>Date & Time</p>
          <p className='font-medium'>Fee</p>
          <p className='font-medium'>Actions</p>
        </div>

        {/* Table Body */}
        {appointments && appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div 
              className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 transition-all' 
              key={index}
            >
              <p className='max-sm:hidden'>{index + 1}</p>
              
              {/* Client Info */}
              <div className='flex items-center gap-2'>
                <img 
                  src={item.userData?.image || assets.upload_area} 
                  className='w-8 h-8 rounded-full object-cover' 
                  alt="" 
                />
                <p>{item.userData?.name || 'N/A'}</p>
              </div>

              {/* Payment Status */}
              <div>
                <p className={`text-xs inline border px-2 rounded-full ${
                  item.payment 
                    ? 'border-green-500 text-green-600' 
                    : 'border-yellow-500 text-yellow-600'
                }`}>
                  {item.payment ? 'Paid' : 'Cash'}
                </p>
              </div>

              {/* Age */}
              <p className='max-sm:hidden'>
                {item.userData?.dob ? calculateAge(item.userData.dob) : 'N/A'}
              </p>

              {/* Date & Time */}
              <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>

              {/* Fee */}
              <p className='font-medium'>{currency}{item.amount}</p>

              {/* Actions */}
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
          <div className='text-center py-20 text-gray-500'>
            <p className='text-lg'>No appointments found</p>
            <p className='text-sm mt-2'>Appointments will appear here once clients book your services</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default DoctorAppointments