import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, AlertTriangle, X, ChevronLeft, Scissors, CreditCard, Phone, DollarSign } from 'lucide-react'

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
    const [dummyPaymentModal, setDummyPaymentModal] = useState(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
    const [currentAppointmentId, setCurrentAppointmentId] = useState(null)
    const [processingPayment, setProcessingPayment] = useState(false)

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
            toast.error(error.message || 'Failed to load appointments')
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
            toast.error(error.message || 'Failed to cancel appointment')
        }
    }

    // Function for dummy Razorpay payment
    const handleDummyRazorpayPayment = () => {
        setProcessingPayment(true)
        
        // Simulate API call delay
        setTimeout(() => {
            // Simulate successful payment
            const updatedAppointments = appointments.map(app => {
                if (app._id === currentAppointmentId) {
                    return { ...app, payment: true }
                }
                return app
            })
            
            setAppointments(updatedAppointments)
            setDummyPaymentModal(false)
            setProcessingPayment(false)
            setPayment('')
            setCurrentAppointmentId(null)
            
            toast.success("Payment successful! You can now reschedule if needed.")
        }, 2000)
    }

    // Function for dummy Stripe payment
    const handleDummyStripePayment = () => {
        setProcessingPayment(true)
        
        // Simulate API call delay
        setTimeout(() => {
            // Simulate successful payment
            const updatedAppointments = appointments.map(app => {
                if (app._id === currentAppointmentId) {
                    return { ...app, payment: true }
                }
                return app
            })
            
            setAppointments(updatedAppointments)
            setDummyPaymentModal(false)
            setProcessingPayment(false)
            setPayment('')
            setCurrentAppointmentId(null)
            
            toast.success("Payment successful! You can now reschedule if needed.")
        }, 2000)
    }

    // Open dummy payment modal (for testing)
    const openDummyPaymentModal = (appointmentId) => {
        setCurrentAppointmentId(appointmentId)
        setSelectedPaymentMethod('')
        setDummyPaymentModal(true)
    }

    // Real payment functions (but will use the dummy ones for testing)
    const appointmentRazorpay = async (appointmentId) => {
        // For testing purposes, use dummy payment
        openDummyPaymentModal(appointmentId)
        
        /* Real implementation would be:
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/payment-razorpay', 
                { appointmentId }, 
                { headers: { token } }
            )
            if (data.success) {
                initPay(data.order)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        */
    }

    const appointmentStripe = async (appointmentId) => {
        // For testing purposes, use dummy payment
        openDummyPaymentModal(appointmentId)
        
        /* Real implementation would be:
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/payment-stripe', 
                { appointmentId }, 
                { headers: { token } }
            )
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
        */
    }

    // Function to get available slots for rescheduling
    const getAvailableSlots = async (stylistId) => {
        try {
            // For demo purposes, generate some sample slots
            const today = new Date()
            const sampleSlots = []
            
            for (let i = 1; i <= 7; i++) {
                const date = new Date()
                date.setDate(today.getDate() + i)
                
                const day = date.getDate()
                const month = date.getMonth() + 1
                const year = date.getFullYear()
                
                const formattedDate = `${day}_${month}_${year}`
                
                const times = []
                for (let hour = 10; hour <= 18; hour++) {
                    if (Math.random() > 0.5) { // randomly include some times
                        times.push(`${hour}:00 AM`)
                    }
                    if (Math.random() > 0.5) {
                        times.push(`${hour}:30 AM`)
                    }
                }
                
                if (times.length > 0) {
                    sampleSlots.push({
                        date: formattedDate,
                        times
                    })
                }
            }
            
            setAvailableSlots(sampleSlots)
            
            /* Real implementation would be:
            const { data } = await axios.get(
                backendUrl + `/api/user/available-slots/${stylistId}`,
                { headers: { token } }
            )
            if (data.success) {
                setAvailableSlots(data.availableSlots)
            } else {
                toast.error(data.message)
            }
            */
        } catch (error) {
            console.log(error)
            toast.error(error.message || 'Failed to fetch available slots')
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
            // For testing, just update the appointments state
            const updatedAppointments = appointments.map(app => {
                if (app._id === appointmentToReschedule._id) {
                    return {
                        ...app,
                        slotDate: selectedDate,
                        slotTime: selectedTime
                    }
                }
                return app
            })
            
            setAppointments(updatedAppointments)
            setRescheduleModal(false)
            setSelectedDate('')
            setSelectedTime('')
            
            toast.success("Appointment rescheduled successfully!")
            
            /* Real implementation would be:
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
            */
        } catch (error) {
            console.log(error)
            toast.error(error.message || 'Failed to reschedule appointment')
        }
    }

    // Generate sample appointment data for testing if needed
    const generateSampleAppointments = () => {
        const sampleData = [
            {
                _id: '1',
                docData: {
                    _id: '101',
                    name: 'Emily Johnson',
                    specialty: 'Hair Styling Specialist',
                    image: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?q=80&w=300',
                    address: {
                        line1: 'StyleStudio Main Salon',
                        line2: '69, Mettu Street, Srirangam'
                    }
                },
                slotDate: '15_6_2023',
                slotTime: '10:00 AM',
                payment: false,
                isCompleted: false,
                cancelled: false
            },
            {
                _id: '2',
                docData: {
                    _id: '102',
                    name: 'Michael Rodriguez',
                    specialty: 'Beard & Grooming Specialist',
                    image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=300',
                    address: {
                        line1: 'StyleStudio Main Salon',
                        line2: '69, Mettu Street, Srirangam'
                    }
                },
                slotDate: '18_6_2023',
                slotTime: '2:30 PM',
                payment: true,
                isCompleted: false,
                cancelled: false
            },
            {
                _id: '3',
                docData: {
                    _id: '103',
                    name: 'Sophia Williams',
                    specialty: 'Hair Coloring Specialist',
                    image: 'https://images.unsplash.com/photo-1605980776566-0486c3ac7617?q=80&w=300',
                    address: {
                        line1: 'StyleStudio Main Salon',
                        line2: '69, Mettu Street, Srirangam'
                    }
                },
                slotDate: '20_5_2023',
                slotTime: '11:00 AM',
                payment: true,
                isCompleted: true,
                cancelled: false
            }
        ]
        
        return sampleData
    }

    useEffect(() => {
        if (token) {
            // For testing purposes, use sample data instead of API call
            const sampleAppointments = generateSampleAppointments()
            setAppointments(sampleAppointments)
            setIsLoading(false)
            
            // In real app, you'd use:
            // getUserAppointments()
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
                                            {item.docData.phone && (
                                                <a 
                                                    href={`tel:${item.docData.phone}`}
                                                    className="mt-3 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors w-full"
                                                >
                                                    <Phone size={14} />
                                                    <span>Contact Stylist</span>
                                                </a>
                                            )}
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
                                                            <br className="hidden sm:block" />
                                                            {item.docData.address?.line2 || " 69, Mettu Street, Srirangam"}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {!item.payment && !item.cancelled && !item.isCompleted && (
                                                    <div className="flex items-start">
                                                        <AlertTriangle size={18} className="mt-0.5 mr-2 text-amber-500 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-medium text-amber-600">Payment Required</p>
                                                            <p className="text-gray-600 text-sm">
                                                                Please complete payment to confirm your appointment
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
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
                                                    <DollarSign size={16} className="mr-1.5" />
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
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
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
            
            {/* Dummy Payment Modal for Testing */}
            <AnimatePresence>
                {dummyPaymentModal && (
                    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <motion.div 
                            className="bg-white rounded-lg max-w-md w-full p-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xl font-semibold text-gray-900">Complete Payment</h3>
                                <button 
                                    onClick={() => {
                                        setDummyPaymentModal(false)
                                        setSelectedPaymentMethod('')
                                    }}
                                    className="text-gray-400 hover:text-gray-500"
                                    disabled={processingPayment}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="border-b border-gray-200 pb-5">
                                <p className="text-gray-500 mb-4">
                                    Select a payment method to complete your booking:
                                </p>
                                
                                <div className="space-y-3">
                                    <div 
                                        className={`border rounded-lg p-3 flex items-center cursor-pointer ${selectedPaymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                                        onClick={() => setSelectedPaymentMethod('stripe')}
                                    >
                                        <div className="flex-shrink-0 mr-3">
                                            <img className="h-8" src={assets.stripe_logo} alt="Stripe" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Stripe</p>
                                            <p className="text-sm text-gray-500">Pay with credit/debit card</p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className={`w-5 h-5 rounded-full border ${selectedPaymentMethod === 'stripe' ? 'border-primary' : 'border-gray-300'} flex items-center justify-center`}>
                                                {selectedPaymentMethod === 'stripe' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        className={`border rounded-lg p-3 flex items-center cursor-pointer ${selectedPaymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                                        onClick={() => setSelectedPaymentMethod('razorpay')}
                                    >
                                        <div className="flex-shrink-0 mr-3">
                                            <img className="h-8" src={assets.razorpay_logo} alt="Razorpay" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Razorpay</p>
                                            <p className="text-sm text-gray-500">Pay with UPI, cards, or bank transfer</p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className={`w-5 h-5 rounded-full border ${selectedPaymentMethod === 'razorpay' ? 'border-primary' : 'border-gray-300'} flex items-center justify-center`}>
                                                {selectedPaymentMethod === 'razorpay' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-5">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-500">Amount:</span>
                                    <span className="text-lg font-semibold">₹1,200</span>
                                </div>
                                
                                <button
                                    onClick={selectedPaymentMethod === 'stripe' ? handleDummyStripePayment : handleDummyRazorpayPayment}
                                    disabled={!selectedPaymentMethod || processingPayment}
                                    className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {processingPayment ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={18} className="mr-2" />
                                            Pay Now
                                        </>
                                    )}
                                </button>
                                
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    This is a test payment and won't charge your card. For testing the rescheduling functionality only.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MyAppointments
