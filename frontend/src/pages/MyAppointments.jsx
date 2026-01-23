import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  X, 
  ChevronLeft,
  Check,
  CheckCircle,
  AlertCircle,
  BadgeCheck,
  ChevronsUp,
  Info,
  AlertTriangle
} from 'lucide-react';

const MyAppointments = () => {
    const { backendUrl, token, currencySymbol = "₹" } = useContext(AppContext);
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [rescheduleModal, setRescheduleModal] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
    const [canReschedule, setCanReschedule] = useState(true);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [localAppointments, setLocalAppointments] = useState([]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const slotDateFormat = (slotDate) => {
        if (!slotDate) return '';
        const dateObj = new Date(slotDate);
        const day = dateObj.getDate();
        const month = dateObj.getMonth();
        const year = dateObj.getFullYear();
        return `${day} ${months[month]} ${year}`;
    };

    const getUserAppointments = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } });
            setAppointments(data.appointments.reverse());
            setLocalAppointments(data.appointments.reverse());
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const cancelAppointment = async () => {
        if (!appointmentToCancel) return;
        
        try {
            setLocalAppointments(prevAppointments => 
                prevAppointments.map(app => 
                    app._id === appointmentToCancel._id ? 
                    { ...app, cancelled: true, cancelledBy: 'user' } : 
                    app
                )
            );
            
            setActiveTab('cancelled');
            
            const { data } = await axios.post(
                backendUrl + '/api/user/cancel-appointment', 
                { appointmentId: appointmentToCancel._id }, 
                { headers: { token } }
            );

            if (data.success) {
                toast.success(data.message);
                setCancelModal(false);
                setAppointmentToCancel(null);
                getUserAppointments();
            } else {
                toast.error(data.message);
                setLocalAppointments(prevAppointments => 
                    prevAppointments.map(app => 
                        app._id === appointmentToCancel._id ? 
                        { ...app, cancelled: false, cancelledBy: null } : 
                        app
                    )
                );
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            setLocalAppointments(prevAppointments => 
                prevAppointments.map(app => 
                    app._id === appointmentToCancel._id ? 
                    { ...app, cancelled: false, cancelledBy: null } : 
                    app
                )
            );
        }
    };

    const getAvailableSlots = async (stylistId, appointmentDate) => {
        setIsRescheduling(true);
        
        try {
            const response = await axios.get(
                backendUrl + `/api/user/available-slots`, 
                { 
                    params: { date: appointmentDate, docId: stylistId },
                    headers: { token } 
                }
            );
            
            if (response.data.success) {
                setAvailableSlots(response.data.slots);
            } else {
                toast.error(response.data.message);
                setAvailableSlots([]);
            }
            
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch available slots");
            setAvailableSlots([]);
        } finally {
            setIsRescheduling(false);
        }
    };

    const checkRescheduleEligibility = (appointment) => {
        if (!appointment || appointment.isCompleted) return false;
        
        const appointmentDateTime = new Date(appointment.slotDateTime);
        const now = new Date();
        const diffMs = appointmentDateTime - now;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        return diffHours > 3;
    };

    const checkCancellationEligibility = (appointment) => {
        if (!appointment || appointment.cancelled || appointment.isCompleted) return false;
        
        const appointmentDateTime = new Date(appointment.slotDateTime);
        const now = new Date();
        const diffMs = appointmentDateTime - now;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        return diffHours > 3;
    };

    const openRescheduleModal = (appointment) => {
        const canReschedule = appointment.cancelled || checkRescheduleEligibility(appointment);
        setCanReschedule(canReschedule);
        
        setAppointmentToReschedule(appointment);
        if (canReschedule) {
            // Load slots starting from tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            setSelectedDate(tomorrowStr);
            getAvailableSlots(appointment.doctorId, tomorrowStr);
        }
        setRescheduleModal(true);
    };

    const openCancelModal = (appointment) => {
        setAppointmentToCancel(appointment);
        setCancelModal(true);
    };

    const rescheduleAppointment = async () => {
        if (!selectedDate || !selectedTime || !appointmentToReschedule) {
            toast.error("Please select both date and time");
            return;
        }

        setIsRescheduling(true);
        
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/reschedule-appointment',
                {
                    userId: appointmentToReschedule.userId,
                    appointmentId: appointmentToReschedule._id,
                    slotDate: selectedDate,
                    slotTime: selectedTime
                },
                { headers: { token } }
            );

            if (data.success) {
                toast.success("Appointment rescheduled successfully!");
                setRescheduleModal(false);
                setSelectedDate('');
                setSelectedTime('');
                setAppointmentToReschedule(null);
                setActiveTab('upcoming');
                getUserAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to reschedule appointment");
        } finally {
            setIsRescheduling(false);
        }
    };

    useEffect(() => {
        if (token) {
            getUserAppointments();
        } else {
            navigate('/login');
        }
    }, [token]);

    useEffect(() => {
        if (appointments.length > 0) {
            setLocalAppointments(appointments);
        }
    }, [appointments]);

    const filteredAppointments = localAppointments.filter(appointment => {
        if (activeTab === 'upcoming') {
            return !appointment.cancelled && !appointment.isCompleted;
        } else if (activeTab === 'completed') {
            return appointment.isCompleted && !appointment.cancelled;
        } else if (activeTab === 'cancelled') {
            return appointment.cancelled;
        }
        return true;
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="ml-1">Back</span>
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Scissors size={24} className="text-primary" />
                        My Appointments
                    </h1>
                    <div className="w-[56px]"></div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm mb-6 p-1 border border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'upcoming'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'completed'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setActiveTab('cancelled')}
                            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'cancelled'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Cancelled
                        </button>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : localAppointments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Scissors size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Appointments Yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            You haven't booked any styling appointments. Schedule your first session with one of our expert stylists.
                        </p>
                        <button 
                            onClick={() => navigate('/stylists')} 
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                        >
                            Browse Stylists
                        </button>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            {activeTab === 'upcoming' ? (
                                <Calendar size={24} className="text-gray-400" />
                            ) : activeTab === 'completed' ? (
                                <CheckCircle size={24} className="text-gray-400" />
                            ) : (
                                <X size={24} className="text-gray-400" />
                            )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            No {activeTab} appointments
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {activeTab === 'upcoming' 
                                ? "You don't have any upcoming appointments scheduled."
                                : activeTab === 'completed'
                                ? "You don't have any completed appointments yet."
                                : "You don't have any cancelled appointments."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredAppointments.map((item, index) => {
                            const isRescheduleEligible = item.cancelled || checkRescheduleEligibility(item);
                            const isCancellable = checkCancellationEligibility(item);
                            
                            return (
                                <motion.div 
                                    key={index} 
                                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <div className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="sm:w-1/4 lg:w-1/5">
                                                <div className="relative mx-auto sm:mx-0 w-32 sm:w-full max-w-[160px]">
                                                    <img 
                                                        className="aspect-square object-cover rounded-xl shadow-sm border border-gray-200" 
                                                        src={item.docData?.image || assets.defaultProfile}
                                                        alt={item.docData?.name || "Stylist"}
                                                    />
                                                    
                                                    <div className="absolute -top-2 -right-2">
                                                        {item.cancelled ? (
                                                            <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                                                                Cancelled
                                                            </div>
                                                        ) : item.isCompleted ? (
                                                            <div className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                                                                Completed
                                                            </div>
                                                        ) : item.payment ? (
                                                            <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                                                                <BadgeCheck size={10} />
                                                                Confirmed
                                                            </div>
                                                        ) : (
                                                            <div className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                                                                Pending
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                            {item.docData?.name || "Stylist"}
                                                        </h3>
                                                        <p className="text-primary text-sm font-medium">
                                                            {item.docData?.speciality || item.service || "Salon Service"}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="border-b border-gray-100 mb-4"></div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <Calendar size={18} className="text-primary mt-0.5" />
                                                            <div>
                                                                <p className="text-xs text-gray-500">Date</p>
                                                                <p className="font-medium text-gray-800">{slotDateFormat(item.slotDate)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <Clock size={18} className="text-primary mt-0.5" />
                                                            <div>
                                                                <p className="text-xs text-gray-500">Time</p>
                                                                <p className="font-medium text-gray-800">{item.slotTime}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <Scissors size={18} className="text-primary mt-0.5" />
                                                            <div>
                                                                <p className="text-xs text-gray-500">Service</p>
                                                                <p className="font-medium text-gray-800">{item.service || "Hair Styling"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto pt-3 border-t border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-gray-800">{currencySymbol}{item.amount}</p>
                                                        
                                                        {item.payment && (
                                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <Check size={12} />
                                                                Paid
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-3">
                                                        {!item.cancelled && !item.isCompleted && isRescheduleEligible && (
                                                            <button
                                                                onClick={() => openRescheduleModal(item)}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                                                            >
                                                                <Calendar size={16} />
                                                                Reschedule
                                                            </button>
                                                        )}
                                                        
                                                        {!item.cancelled && !item.isCompleted && isCancellable && (
                                                            <button
                                                                onClick={() => openCancelModal(item)}
                                                                className="flex items-center gap-1.5 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
                                                            >
                                                                <X size={16} />
                                                                Cancel
                                                            </button>
                                                        )}
                                                        
                                                        {(item.isCompleted || item.cancelled) && (
                                                            <button
                                                                onClick={() => navigate(`/appointment/${item.doctorId}`)}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm"
                                                            >
                                                                <Calendar size={16} />
                                                                Book Again
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {item.cancelled && item.cancelledBy && (
                                            <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2 text-sm">
                                                <AlertCircle size={16} className="text-red-500" />
                                                <span className="text-red-800">
                                                    Cancelled by {item.cancelledBy === 'admin' ? 'Admin' : 'You'}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {!item.cancelled && !item.isCompleted && !isCancellable && (
                                            <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-center gap-2 text-xs">
                                                <AlertTriangle size={14} className="text-yellow-500" />
                                                <span className="text-yellow-800">
                                                    Appointments can only be cancelled at least 3 hours before the scheduled time.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
                
                {/* Reschedule Modal */}
                <AnimatePresence>
                    {rescheduleModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        >
                            <motion.div 
                                className="bg-white rounded-xl overflow-hidden max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                            >
                                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Reschedule Appointment</h3>
                                    <button 
                                        onClick={() => {
                                            setRescheduleModal(false);
                                            setAppointmentToReschedule(null);
                                            setSelectedDate('');
                                            setSelectedTime('');
                                        }} 
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="p-6">
                                    {!canReschedule ? (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                            <AlertTriangle size={40} className="text-yellow-500 mx-auto mb-2" />
                                            <p className="text-yellow-800 font-medium mb-1">Unable to Reschedule</p>
                                            <p className="text-yellow-700 text-sm">
                                                Appointments can only be rescheduled at least 3 hours before the scheduled time.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                <h4 className="font-medium text-gray-800 mb-3">Current Appointment</h4>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Date</p>
                                                        <p className="font-medium">{slotDateFormat(appointmentToReschedule?.slotDate)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Time</p>
                                                        <p className="font-medium">{appointmentToReschedule?.slotTime}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Select New Date</label>
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                                                    className="w-full border rounded-lg p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                    onChange={(e) => {
                                                        setSelectedDate(e.target.value);
                                                        setSelectedTime('');
                                                        
                                                        if (e.target.value) {
                                                            getAvailableSlots(appointmentToReschedule.doctorId, e.target.value);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            
                                            {selectedDate && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select New Time</label>
                                                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                                        {isRescheduling ? (
                                                            <div className="col-span-3 py-8 text-center">
                                                                <div className="inline-block animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                                            </div>
                                                        ) : availableSlots.length === 0 ? (
                                                            <div className="col-span-3 p-4 text-center text-gray-500">
                                                                No available slots for this date
                                                            </div>
                                                        ) : (
                                                            availableSlots.map((slot, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    onClick={() => setSelectedTime(slot.startTime)}
                                                                    className={`p-2 text-sm rounded-md transition-colors ${
                                                                        selectedTime === slot.startTime 
                                                                            ? 'bg-primary text-white' 
                                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    }`}
                                                                >
                                                                    {slot.displayTime.split(' - ')[0]}
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex items-start gap-2">
                                                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                <p>Rescheduling must be done at least 3 hours before your appointment time.</p>
                                            </div>
                                            
                                            <div className="flex justify-end gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setRescheduleModal(false);
                                                        setAppointmentToReschedule(null);
                                                        setSelectedDate('');
                                                        setSelectedTime('');
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={rescheduleAppointment}
                                                    disabled={!selectedDate || !selectedTime || isRescheduling}
                                                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                                                        !selectedDate || !selectedTime || isRescheduling
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                            : 'bg-primary text-white hover:bg-primary/90'
                                                    }`}
                                                >
                                                    {isRescheduling ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Calendar size={18} />
                                                            Reschedule
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Cancel Confirmation Modal */}
                <AnimatePresence>
                    {cancelModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        >
                            <motion.div 
                                className="bg-white rounded-xl overflow-hidden max-w-md w-full shadow-xl"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                            >
                                <div className="p-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                                            <AlertTriangle size={32} className="text-red-500" />
                                        </div>
                                        
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancel Appointment?</h3>
                                        <p className="text-gray-600 mb-6">
                                            Are you sure you want to cancel your appointment on{' '}
                                            <span className="font-medium">{slotDateFormat(appointmentToCancel?.slotDate)}</span> at{' '}
                                            <span className="font-medium">{appointmentToCancel?.slotTime}</span>?
                                        </p>
                                        
                                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-6 text-sm text-yellow-800 text-left">
                                            <p className="flex items-start gap-2">
                                                <Info size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                                {appointmentToCancel?.payment 
                                                    ? "Cancellations may be subject to our refund policy. Please check your email for confirmation and refund details."
                                                    : "You can cancel unpaid appointments without any charge."
                                                }
                                            </p>
                                        </div>
                                        
                                        <div className="flex justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCancelModal(false);
                                                    setAppointmentToCancel(null);
                                                }}
                                                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                            >
                                                No, Keep It
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelAppointment}
                                                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                                            >
                                                Yes, Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-24 md:bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                >
                    <ChevronsUp size={20} />
                </button>
            </div>
        </div>
    );
};

export default MyAppointments;