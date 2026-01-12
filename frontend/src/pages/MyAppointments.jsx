import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { motion, AnimatePresence } from 'framer-motion' // You'll need to install this package
import { Calendar, Clock, MapPin, AlertTriangle, X, ChevronLeft, Scissors } from 'lucide-react'

const MyAppointments = () => {
    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [payment, setPayment] = useState('')
    const [rescheduleModal, setRescheduleModal] = useState(false)
    const [cancelModal, setCancelModal] = useState(false)
    const [appointmentToCancel, setAppointmentToCancel] = useState(null)
    const [appointmentToReschedule, setAppointmentToReschedule] = useState(null)
    const [availableSlots, setAvailableSlots] = useState([])
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    }

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        setIsLoading(true)
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            setAppointments(data.appointments.reverse())
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async () => {
        if (!appointmentToCancel) return
        
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/cancel-appointment', 
                { appointmentId: appointmentToCancel._id }, 
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                setCancelModal(false)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Haircut Session Payment',
            description: "Styling Session Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                    if (data.success) {
                        toast.success("Payment successful! You can now reschedule if needed.")
                        navigate('/my-appointments')
                        getUserAppointments()
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.message)
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // Function to make payment using razorpay
    const appointmentRazorpay = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
            if (data.success) {
                initPay(data.order)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to make payment using stripe
    const appointmentStripe = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } })
            if (data.success) {
                const { session_url } = data
                window.location.replace(session_url)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to get available slots for rescheduling
    const getAvailableSlots = async (stylistId) => {
        try {
            const { data } = await axios.get(backendUrl + `/api/user/available-slots/${stylistId}`, { headers: { token } })
            if (data.success) {
                setAvailableSlots(data.availableSlots)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Open reschedule modal
    const openRescheduleModal = (appointment) => {
        setAppointmentToReschedule(appointment)
        getAvailableSlots(appointment.docData._id)
        setRescheduleModal(true)
    }

    // Open cancel confirmation modal
    const openCancelModal = (appointment) => {
        setAppointmentToCancel(appointment)
        setCancelModal(true)
    }

    // Reschedule appointment function
    const rescheduleAppointment = async () => {
        if (!selectedDate || !selectedTime) {
            toast.error("Please select both date and time")
            return
        }

        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/reschedule-appointment',
                { 
                    appointmentId: appointmentToReschedule._id, 
                    newDate: selectedDate, 
                    newTime: selectedTime 
                },
                { headers: { token } }
            )

            if (data.success) {
                toast.success("Appointment rescheduled successfully!")
                setRescheduleModal(false)
                setSelectedDate('')
                setSelectedTime('')
                getUserAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (token) {
            getUserAppointments()
        }
    }, [token])

    return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="text-gray-500 hover:text-gray-700 flex items-center"
                    >
                        <ChevronLeft size={20} />
                        <span className="hidden sm:inline-block ml-1">Back</span>
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Appointments</h1>
                    <div className="w-6 sm:w-[68px]"></div> {/* Empty div for centering the heading */}
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <Scissors size={40} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-2">You don't have any styling appointments yet.</p>
                        <p className="text-gray-400 text-sm mb-6">Book a session with one of our expert stylists</p>
                        <button 
                            onClick={() => navigate('/doctors')} 
                            className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-all"
                        >
                            Book Your Styling Session
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {appointments.map((item, index) => (
                            <motion.div 
                                key={index} 
                                className="bg-white rounded-lg shadow-sm overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        <div className="sm:flex-shrink-0 mx-auto sm:mx-0">
                                            <img 
                                                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-md mx-auto sm:mx-0" 
                                                src={item.docData.image} 
                                                alt={item.docData.name} 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between flex-wrap gap-2 mb-3">
                                                <h2 className="text-xl font-bold text-gray-800">{item.docData.name}</h2>
                                                <div className="flex items-center">
                                                    {item.isCompleted && (
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                            Completed
                                                        </span>
                                                    )}
                                                    {item.cancelled && (
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            Cancelled
                                                        </span>
                                                    )}
                                                    {item.payment && !item.isCompleted && !item.cancelled && (
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            Confirmed
                                                        </span>
                                                    )}
                                                    {!item.payment && !item.cancelled && (
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                            Payment Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-600 font-medium">{item.docData.specialty || item.docData.speciality}</p>
                                            
                                            <div className="mt-4 space-y-3">
                                                <div className="flex items-start">
                                                    <Clock size={18} className="mt-0.5 mr-2 text-primary flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Appointment Time</p>
                                                        <p className="text-gray-800">
                                                            {slotDateFormat(item.slotDate)} at <span className="font-semibold">{item.slotTime}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start">
                                                    <MapPin size={18} className="mt-0.5 mr-2 text-primary flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Location</p>
                                                        <p className="text-gray-800">
                                                            {item.docData.address?.line1 || "StyleStudio Main Salon"},
                                                            {item.docData.address?.line2 || " 69, Mettu Street, Srirangam"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 pt-4 border-t">
                                        <div className="flex flex-wrap gap-3 justify-end">
                                            {/* Payment Options */}
                                            {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && (
                                                <button 
                                                    onClick={() => setPayment(item._id)} 
                                                    className="px-5 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                                                >
                                                    <span>Pay Now</span>
                                                </button>
                                            )}
                                            
                                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && (
                                                <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                                                    <button 
                                                        onClick={() => appointmentStripe(item._id)} 
                                                        className="px-4 py-2 border rounded-md flex items-center justify-center hover:bg-gray-50"
                                                    >
                                                        <img className="h-6" src={assets.stripe_logo} alt="Stripe" />
                                                    </button>
                                                    <button 
                                                        onClick={() => appointmentRazorpay(item._id)} 
                                                        className="px-4 py-2 border rounded-md flex items-center justify-center hover:bg-gray-50"
                                                    >
                                                        <img className="h-6" src={assets.razorpay_logo} alt="Razorpay" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setPayment('')} 
                                                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {/* Reschedule button */}
                                            {!item.cancelled && item.payment && !item.isCompleted && (
                                                <button 
                                                    onClick={() => openRescheduleModal(item)}
                                                    className="px-5 py-2 border border-indigo-500 text-indigo-500 rounded-md hover:bg-indigo-500 hover:text-white transition-colors flex items-center justify-center"
                                                >
                                                    <Calendar size={16} className="mr-1.5" />
                                                    <span>Reschedule</span>
                                                </button>
                                            )}
                                            
                                            {/* Cancel button */}
                                            {!item.cancelled && !item.isCompleted && (
                                                <button 
                                                    onClick={() => openCancelModal(item)} 
                                                    className="px-5 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                                                >
                                                    <X size={16} className="mr-1.5" />
                                                    <span>Cancel</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Reschedule Modal */}
            <AnimatePresence>
                {rescheduleModal && appointmentToReschedule && (
                    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <motion.div 
                            className="bg-white rounded-lg max-w-md w-full p-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">Reschedule Appointment</h3>
                                <button 
                                    onClick={() => {
                                        setRescheduleModal(false)
                                        setSelectedDate('')
                                        setSelectedTime('')
                                    }}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div>
                                <div className="flex items-center p-3 mb-4 bg-blue-50 text-blue-800 rounded-md">
                                    <Calendar size={20} className="mr-2 text-blue-500" />
                                    <p className="text-sm">
                                        Current appointment: <span className="font-medium">{slotDateFormat(appointmentToReschedule.slotDate)} at {appointmentToReschedule.slotTime}</span>
                                    </p>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Select New Date
                                    </label>
                                    <select 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value)
                                            setSelectedTime('')
                                        }}
                                    >
                                        <option value="">Select a date</option>
                                        {availableSlots.map((slot, index) => (
                                            <option key={index} value={slot.date}>
                                                {slotDateFormat(slot.date)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {selectedDate && (
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                            Select New Time
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableSlots
                                                .find(slot => slot.date === selectedDate)
                                                ?.times.map((time, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        className={`px-3 py-2 text-center text-sm rounded-md transition-colors ${
                                                            selectedTime === time
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setSelectedTime(time)}
                                                    >
                                                        {time}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setRescheduleModal(false)
                                            setSelectedDate('')
                                            setSelectedTime('')
                                        }}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={rescheduleAppointment}
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        disabled={!selectedDate || !selectedTime}
                                    >
                                        Confirm Reschedule
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {cancelModal && appointmentToCancel && (
                    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <motion.div 
                            className="bg-white rounded-lg max-w-md w-full p-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        >
                            <div className="text-center mb-6">
                                <div className="mx-auto flex items-center justify-center   w-16 rounded-full bg-red-100 mb-4">
                                    <AlertTriangle size={30} className="text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Appointment</h3>
                                <p className="text-gray-500">
                                    Are you sure you want to cancel your appointment with <span className="font-medium text-gray-700">{appointmentToCancel.docData.name}</span> on <span className="font-medium text-gray-700">{slotDateFormat(appointmentToCancel.slotDate)} at {appointmentToCancel.slotTime}</span>?
                                </p>
                                
                                {appointmentToCancel.payment && (
                                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md">
                                        <p>You've already paid for this appointment. Cancellation policies may apply.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-center gap-3 sm:gap-4">
                                <button
                                    onClick={() => setCancelModal(false)}
                                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex-1 sm:flex-initial"
                                >
                                    Keep Appointment
                                </button>
                                <button
                                    onClick={cancelAppointment}
                                    className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex-1 sm:flex-initial"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MyAppointments
