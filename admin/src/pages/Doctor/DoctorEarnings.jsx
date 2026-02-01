import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorEarnings = () => {

  const { dToken, appointments, getAppointments } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [filterPeriod, setFilterPeriod] = useState('all') // all, today, week, month
  const [paymentFilter, setPaymentFilter] = useState('all') // all, paid, pending

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  // Filter appointments based on period and payment status
  useEffect(() => {
    if (!appointments) return

    let filtered = [...appointments]

    // Filter by time period
    const now = new Date()
    if (filterPeriod === 'today') {
      const today = now.toDateString()
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.slotDateTime || apt.slotDate).toDateString()
        return aptDate === today
      })
    } else if (filterPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.slotDateTime || apt.slotDate)
        return aptDate >= weekAgo && aptDate <= now
      })
    } else if (filterPeriod === 'month') {
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.slotDateTime || apt.slotDate)
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear
      })
    }

    // Filter by payment status
    if (paymentFilter === 'paid') {
      filtered = filtered.filter(apt => apt.payment && apt.isCompleted)
    } else if (paymentFilter === 'pending') {
      filtered = filtered.filter(apt => !apt.isCompleted && !apt.cancelled)
    }

    // Filter out cancelled appointments
    filtered = filtered.filter(apt => !apt.cancelled)

    setFilteredAppointments(filtered)
  }, [appointments, filterPeriod, paymentFilter])

  // Calculate totals
  const calculateTotals = () => {
    const totals = {
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      completedCount: 0,
      pendingCount: 0
    }

    filteredAppointments.forEach(apt => {
      totals.totalAmount += apt.amount || 0
      totals.paidAmount += apt.paidAmount || apt.amount || 0
      totals.remainingAmount += apt.remainingAmount || 0
      
      if (apt.isCompleted) totals.completedCount++
      else totals.pendingCount++
    })

    return totals
  }

  const totals = calculateTotals()

  return (
    <div className='w-full max-w-6xl m-5'>

      <p className='mb-3 text-lg font-medium'>Earnings & Payouts</p>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white p-4 rounded-lg border-2 border-gray-100'>
          <p className='text-gray-500 text-sm'>Total Earned</p>
          <p className='text-2xl font-semibold text-gray-700'>{currency}{totals.totalAmount}</p>
        </div>
        <div className='bg-white p-4 rounded-lg border-2 border-green-100'>
          <p className='text-gray-500 text-sm'>Paid Amount</p>
          <p className='text-2xl font-semibold text-green-600'>{currency}{totals.paidAmount}</p>
        </div>
        <div className='bg-white p-4 rounded-lg border-2 border-orange-100'>
          <p className='text-gray-500 text-sm'>Remaining</p>
          <p className='text-2xl font-semibold text-orange-600'>{currency}{totals.remainingAmount}</p>
        </div>
        <div className='bg-white p-4 rounded-lg border-2 border-blue-100'>
          <p className='text-gray-500 text-sm'>Completed</p>
          <p className='text-2xl font-semibold text-blue-600'>{totals.completedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg border mb-4 flex flex-wrap gap-4'>
        <div className='flex-1 min-w-[200px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Time Period</label>
          <select 
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-primary'
          >
            <option value='all'>All Time</option>
            <option value='today'>Today</option>
            <option value='week'>Last 7 Days</option>
            <option value='month'>This Month</option>
          </select>
        </div>
        <div className='flex-1 min-w-[200px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Payment Status</label>
          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-primary'
          >
            <option value='all'>All</option>
            <option value='paid'>Paid & Completed</option>
            <option value='pending'>Pending</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className='bg-white border rounded text-sm max-h-[60vh] overflow-y-scroll'>
        
        {/* Table Header */}
        <div className='max-sm:hidden grid grid-cols-[0.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-1 py-3 px-6 border-b bg-gray-50 sticky top-0'>
          <p className='font-medium'>#</p>
          <p className='font-medium'>Client</p>
          <p className='font-medium'>Date</p>
          <p className='font-medium'>Service</p>
          <p className='font-medium'>Total</p>
          <p className='font-medium'>Paid</p>
          <p className='font-medium'>Remaining</p>
          <p className='font-medium'>Status</p>
        </div>

        {/* Table Body */}
        {filteredAppointments && filteredAppointments.length > 0 ? (
          filteredAppointments.map((item, index) => (
            <div 
              className='flex flex-wrap justify-between max-sm:gap-2 max-sm:text-base sm:grid grid-cols-[0.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 transition-all' 
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
                <div>
                  <p className='font-medium'>{item.userData?.name || 'N/A'}</p>
                  <p className='text-xs text-gray-400'>{item.userData?.phone || ''}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <p>{slotDateFormat(item.slotDate)}</p>
                <p className='text-xs text-gray-400'>{item.slotTime}</p>
              </div>

              {/* Service */}
              <p className='text-xs'>
                {item.services && item.services.length > 0 
                  ? item.services.map(s => s.name).join(', ')
                  : item.service || 'Service'
                }
              </p>

              {/* Total Amount */}
              <p className='font-medium'>{currency}{item.amount}</p>

              {/* Paid Amount */}
              <p className='text-green-600 font-medium'>
                {currency}{item.paidAmount || item.amount}
              </p>

              {/* Remaining Amount */}
              <p className={`font-medium ${item.remainingAmount > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                {currency}{item.remainingAmount || 0}
              </p>

              {/* Status */}
              <div className='flex flex-col gap-1'>
                {item.isCompleted ? (
                  <span className='px-2 py-1 bg-green-100 text-green-700 rounded text-xs text-center'>
                    Completed
                  </span>
                ) : (
                  <span className='px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs text-center'>
                    Pending
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-xs text-center ${
                  item.payment 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {item.paymentMethod || (item.payment ? 'Paid' : 'Cash')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className='text-center py-20 text-gray-500'>
            <p className='text-lg'>No transactions found</p>
            <p className='text-sm mt-2'>Transactions will appear here once appointments are completed</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default DoctorEarnings