import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Phone, 
  Scissors, 
  Star, 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle,
  ChevronLeft, 
  CreditCard, 
  Instagram, 
  Mail,
  Award,
  User,
  X,
  CheckCircle2,
  ArrowRight,
  Shield,
  AlertTriangle
} from "lucide-react";

const Appointment = () => {
    const { docId } = useParams();
    const { doctors: stylists, currencySymbol, backendUrl, token, getDoctosData: getStylesData } = useContext(AppContext);
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Payment gateway setup
    const stripePromise = loadStripe('pk_test_51NpjZGSJQz3QA6GnHyUmwbQtcYfeTHfQdl0i7YpeCor7Vl6qXn2nKUDRdx6AldHDhxnRUiUJRuAdBECFIwE0QQGy00Ys6rUGi8');
    const razorpayKeyId = 'rzp_test_8NBbBv2vkvuTtj';

    const [stylistInfo, setStylistInfo] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlotISO, setSelectedSlotISO] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [slotSettings, setSlotSettings] = useState(null);

    const navigate = useNavigate();

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const getServicesBySpeciality = (speciality) => {
        const baseServices = [
            { id: 1, name: "Classic Haircut", price: 500 },
            { id: 2, name: "Styling & Blowout", price: 800 },
        ];
        
        const specialityServices = {
            "Hair Styling Specialist": [
                { id: 3, name: "Premium Style Cut", price: 1200 },
                { id: 4, name: "Hair Texture Service", price: 1800 },
            ],
            "Hair Coloring Specialist": [
                { id: 5, name: "Root Touch-up", price: 1500 },
                { id: 6, name: "Full Color", price: 2500 },
                { id: 7, name: "Highlights", price: 3000 },
            ],
            "Beard & Grooming Specialist": [
                { id: 8, name: "Beard Trim & Shape", price: 400 },
                { id: 9, name: "Luxury Shave", price: 800 },
                { id: 10, name: "Beard Color", price: 1200 },
            ],
            "Hair Treatment Specialist": [
                { id: 11, name: "Deep Conditioning", price: 1000 },
                { id: 12, name: "Scalp Treatment", price: 1500 },
                { id: 13, name: "Keratin Treatment", price: 4000 },
            ],
            "Bridal Hairstylist": [
                { id: 14, name: "Bridal Trial", price: 2000 },
                { id: 15, name: "Wedding Day Style", price: 5000 },
                { id: 16, name: "Bridesmaid Style", price: 2500 },
            ],
            "Unisex Hairstylist": [
                { id: 17, name: "Men's Haircut", price: 400 },
                { id: 18, name: "Women's Haircut", price: 700 },
                { id: 19, name: "Kids Haircut", price: 300 },
            ],
        };

        return [
            ...baseServices,
            ...(specialityServices[speciality] || [])
        ];
    };

    const fetchSlotSettings = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/public/slot-settings');
            if (data) {
                setSlotSettings(data);
            }
        } catch (error) {
            console.error("Error fetching slot settings:", error);
            // Use default settings if fetch fails
            setSlotSettings({
                slotStartTime: "09:00",
                slotEndTime: "17:00",
                slotDuration: 30,
                breakTime: false,
                breakStartTime: "13:00",
                breakEndTime: "14:00",
                daysOpen: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                ],
                allowRescheduling: true,
                rescheduleHoursBefore: 24,
                maxAdvanceBookingDays: 3,
                minBookingTimeBeforeSlot: 0
            });
        }
    };

    const fetchStylistInfo = async () => {
        const stylistInfo = stylists.find((stylist) => stylist._id === docId);
        setStylistInfo(stylistInfo);
    };

    const fetchSlots = async (dateObj) => {
        try {
            setLoading(true);

            const dateStr = dateObj.toISOString().split("T")[0];

            const { data } = await axios.get(
                `${backendUrl}/api/user/available-slots`,
                {
                    params: {
                        date: dateStr,
                        docId
                    },
                    headers: { token }
                }
            );

            if (data.success) {
                setAvailableSlots(data.slots);
            } else {
                setAvailableSlots([]);
                toast.warning(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load slots");
            setAvailableSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const processPayment = async (method) => {
        setPaymentMethod(method);
        setPaymentLoading(true);
        
        try {
            if (method === 'stripe') {
                // Stripe payment flow
                const stripe = await stripePromise;
                
                // In a real implementation, you'd create a payment intent on your server
                // For this demo, we'll simulate a successful payment
                setTimeout(() => {
                    setPaymentLoading(false);
                    setPaymentSuccess(true);
                    
                    // After successful payment, book the appointment
                    completeBooking(method);
                }, 1500);
                
            } else if (method === 'razorpay') {
                const res = await loadRazorpayScript();
                if (!res) {
                    toast.error("Razorpay SDK failed to load");
                    setPaymentLoading(false);
                    return;
                }

                const options = {
                    key: razorpayKeyId,
                    amount: selectedService.price * 100,
                    currency: "INR",
                    name: "Salon Stylist",
                    description: `Booking with ${stylistInfo.name} for ${selectedService.name}`,
                    image: assets.logo || "https://example.com/your_logo.png",
                    handler: function (response) {
                        // Payment successful
                        setPaymentLoading(false);
                        setPaymentSuccess(true);
                        
                        // After successful payment, book the appointment
                        completeBooking('razorpay');
                    },
                    prefill: {
                        name: "Customer Name",
                        email: "customer@example.com",
                        contact: "9999999999"
                    },
                    notes: {
                        address: "Salon Address"
                    },
                    theme: {
                        color: "#8B5CF6" // Use your primary color
                    },
                    modal: {
                        ondismiss: function() {
                            setPaymentLoading(false);
                        }
                    }
                };
                
                const rzpay = new window.Razorpay(options);
                rzpay.open();
                
            } else {
                // Fallback for other payment methods or errors
                setTimeout(() => {
                    setPaymentLoading(false);
                    setPaymentSuccess(true);
                    
                    // After successful payment, book the appointment
                    completeBooking(method);
                }, 1500);
            }
        } catch (error) {
            console.error("Payment error:", error);
            setPaymentLoading(false);
            toast.error("Payment failed. Please try again.");
        }
    };

    const initiateBooking = () => {
        if (!token) {
            toast.warning('Login to book appointment');
            return navigate('/login');
        }

        if (!selectedSlotISO) {
            return toast.warning('Please select a time slot');
        }

        if (!selectedService) {
            return toast.warning('Please select a service');
        }

        if (!paymentMethod) {
            return toast.warning('Please select a payment method');
        }

        processPayment(paymentMethod);
    };

    const completeBooking = async (paymentMethod) => {
    setBookingLoading(true);

    // YYYY-MM-DD
    const slotDate = selectedDate.toISOString().split("T")[0];

    try {
        const { data } = await axios.post(
            backendUrl + '/api/user/book-appointment',
            {
                docId,
                slotDate,
                slotTime: selectedSlotISO, // ISO string
                service: selectedService.name,
                price: selectedService.price,
                paymentMethod
            },
            { headers: { token } }
        );

        if (data.success) {
            toast.success(data.message);

            // 🔁 1. Refresh available slots immediately
            await fetchSlots(selectedDate);

            // 🔄 2. Reset selected slot
            setSelectedSlotISO('');

            // 🔄 3. Refresh stylist data (optional)
            getStylesData();

            // ⏳ 4. Redirect after short delay
            setTimeout(() => {
                setBookingLoading(false);
                setShowPaymentModal(false);
                navigate('/my-appointments');
            }, 1500);

        } else {
            toast.error(data.message);
            setBookingLoading(false);
        }

    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Error booking appointment');
        setBookingLoading(false);
    }
};


    useEffect(() => {
        fetchSlotSettings();
    }, []);

    useEffect(() => {
        if (stylists && stylists.length > 0) {
            fetchStylistInfo();
        }
    }, [stylists, docId]);

    if (!stylistInfo || !slotSettings) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Get services based on stylist specialty
    const services = getServicesBySpeciality(stylistInfo.speciality);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
                <div className="mb-8 flex items-center">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors mr-4"
                    >
                        <ChevronLeft size={24} className="text-gray-500" />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Book Your Appointment</h1>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Stylist Profile Section */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Profile Image */}
                            <div className="md:w-1/4 lg:w-1/5">
                                <div className="relative">
                                    <img 
                                        src={stylistInfo.image} 
                                        alt={stylistInfo.name} 
                                        className="w-full aspect-square object-cover rounded-xl shadow-md border border-white" 
                                    />
                                    
                                    {stylistInfo.available && (
                                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Available 
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-6 space-y-3">
                                    {stylistInfo?.phone && (
                                        <a
                                            href={`tel:${stylistInfo.phone}`}
                                            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
                                        >
                                            <Phone size={16} className="text-gray-500" />
                                            <span>{stylistInfo.phone}</span>
                                        </a>
                                    )}
                                    
                                    {stylistInfo?.email && (
                                        <a
                                            href={`mailto:${stylistInfo.email}`}
                                            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
                                        >
                                            <Mail size={16} className="text-gray-500" />
                                            <span>{stylistInfo.email}</span>
                                        </a>
                                    )}
                                    
                                    {stylistInfo?.instagram && (
                                        <a
                                            href={`https://instagram.com/${stylistInfo.instagram}`}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
                                        >
                                            <Instagram size={16} className="text-gray-500" />
                                            <span>@{stylistInfo.instagram}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                            
                            {/* Profile Info */}
                            <div className="md:w-3/4 lg:w-4/5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{stylistInfo.name}</h1>
                                            <img className="w-6 h-6" src={assets.verified_icon} alt="Verified" />
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-gray-600">
                                            <p className="text-primary font-medium">{stylistInfo.speciality}</p>
                                            <span className="hidden sm:inline text-gray-300">•</span>
                                            <div className="flex items-center gap-1">
                                                <Award size={16} className="text-primary/80" />
                                                <span>{stylistInfo.experience}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* About Section */}
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-800">About</h3>
                                        <User size={14} className="text-primary" />
                                    </div>
                                    <p className="text-gray-600">{stylistInfo.about || "Professional hairstylist with expertise in modern cutting techniques, color services, and personalized styling."}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Scissors size={14} className="text-primary" />
                                            Starting Price
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">{currencySymbol}{stylistInfo.price || stylistInfo.fees || 500}</div>
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Award size={14} className="text-primary" />
                                            Experience
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">{stylistInfo.experience}</div>
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Clock size={14} className="text-primary" />
                                            Working Hours
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">{slotSettings.slotStartTime} - {slotSettings.slotEndTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Booking Steps Indicator */}
                    <div className="px-6 sm:px-8 py-4 border-b border-gray-200 bg-white">
                        <div className="flex items-center justify-between max-w-3xl mx-auto">
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-medium`}>
                                    1
                                </div>
                                <div className={`h-1 w-12 sm:w-20 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                <div className={`w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-medium`}>
                                    2
                                </div>
                                <div className={`h-1 w-12 sm:w-20 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                <div className={`w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-medium`}>
                                    3
                                </div>
                            </div>
                            <div className="hidden sm:flex text-sm text-gray-600 space-x-4">
                                <span className={currentStep === 1 ? "font-medium text-primary" : ""}>Select Service</span>
                                <span className={currentStep === 2 ? "font-medium text-primary" : ""}>Choose Time</span>
                                <span className={currentStep === 3 ? "font-medium text-primary" : ""}>Payment</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Booking Form Container */}
                    <div className="p-6 sm:p-8">
                        {currentStep === 1 && (
                            <div className="animate-fadeIn">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Select Service</h2>
                                
                                {/* Services Selection */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {services.map((service) => (
                                        <div 
                                            key={service.id}
                                            onClick={() => {
                                                setSelectedService(service);
                                                setCurrentStep(2);
                                            }}
                                            className={`p-5 rounded-xl cursor-pointer transition-all ${
                                                selectedService?.id === service.id
                                                    ? 'border-2 border-primary bg-primary/5 shadow-md'
                                                    : 'border border-gray-200 hover:border-primary/50 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">{service.name}</h3>
                                                </div>
                                                {selectedService?.id === service.id && (
                                                    <CheckCircle2 size={20} className="text-primary" />
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
                                                <span className="font-bold text-gray-800 text-lg">{currencySymbol}{service.price}</span>
                                                <button className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {currentStep === 2 && (
                            <div className="animate-fadeIn">
                                {/* Back button */}
                                <div className="mb-6">
                                    <button 
                                        onClick={() => setCurrentStep(1)} 
                                        className="flex items-center text-gray-600 hover:text-primary transition-colors"
                                    >
                                        <ChevronLeft size={18} />
                                        <span className="text-sm">Back to Services</span>
                                    </button>
                                </div>
                                
                                {/* Selected service summary */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{selectedService?.name}</h3>
                                        </div>
                                        <div className="text-lg font-bold text-primary">{currencySymbol}{selectedService?.price}</div>
                                    </div>
                                </div>
                            
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Select Date & Time</h2>
                                
                                {/* Date Selection */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
                                    
                                    <input
                                        type="date"
                                        className="w-full sm:w-auto border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const date = new Date(e.target.value);
                                                setSelectedDate(date);
                                                setSelectedSlotISO('');
                                                fetchSlots(date);
                                            }
                                        }}
                                    />
                                </div>
                                
                                {/* Time Selection */}
                                {selectedDate && (
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Available Times for {selectedDate.toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </label>
                                        
                                        {loading ? (
                                            <div className="flex justify-center py-6">
                                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                            </div>
                                        ) : availableSlots.length === 0 ? (
                                            <p className="text-gray-500">No slots available for this date</p>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {availableSlots.map((slot, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => setSelectedSlotISO(slot.startTime)}
                                                        className={`py-3 px-4 text-center rounded-lg cursor-pointer transition-all ${
                                                            slot.startTime === selectedSlotISO 
                                                                ? 'bg-primary text-white shadow-md' 
                                                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100'
                                                        }`}
                                                    >
                                                        {slot.displayTime}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Action Button */}
                                <div className="mt-8 flex justify-end">
                                    <button 
                                        onClick={() => {
                                            if (selectedSlotISO) {
                                                setCurrentStep(3);
                                            } else {
                                                toast.warning("Please select a time slot");
                                            }
                                        }}
                                        disabled={!selectedSlotISO}
                                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                            !selectedSlotISO
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg'
                                        }`}
                                    >
                                        <span>Continue to Payment</span>
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {currentStep === 3 && (
                            <div className="animate-fadeIn max-w-2xl mx-auto">
                                {/* Back button */}
                                <div className="mb-6">
                                    <button 
                                        onClick={() => setCurrentStep(2)} 
                                        className="flex items-center text-gray-600 hover:text-primary transition-colors"
                                    >
                                        <ChevronLeft size={18} />
                                        <span className="text-sm">Back to Schedule</span>
                                    </button>
                                </div>
                                
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Review and Pay</h2>
                                
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-primary" />
                                        Appointment Summary
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                                            <div>
                                                <span className="text-gray-600 text-sm">Stylist</span>
                                                <p className="font-medium text-gray-800">{stylistInfo.name}</p>
                                            </div>
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                                <img src={stylistInfo.image} alt={stylistInfo.name} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200">
                                            <div>
                                                <span className="text-gray-600 text-sm">Service</span>
                                                <p className="font-medium text-gray-800">{selectedService?.name}</p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-gray-600 text-sm">Date & Time</span>
                                                <p className="font-medium text-gray-800">
                                                    {selectedDate.toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {selectedSlotISO ? new Date(selectedSlotISO).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : selectedSlotISO}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-lg">
                                            <span className="font-medium text-gray-800">Total Amount</span>
                                            <span className="font-bold text-gray-900">{currencySymbol}{selectedService?.price}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-800">Select Payment Method</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setPaymentMethod('stripe')}
                                            className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                                                paymentMethod === 'stripe'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                                            }`}
                                            disabled={paymentLoading}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={assets.stripe_logo} alt="Stripe" className="h-8 w-auto" />
                                                <span className="font-medium text-gray-800">Pay with Stripe</span>
                                            </div>
                                            {paymentMethod === 'stripe' && !paymentLoading && <CheckCircle2 size={20} className="text-primary" />}
                                        </button>
                                        
                                        <button
                                            onClick={() => setPaymentMethod('razorpay')}
                                            className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                                                paymentMethod === 'razorpay'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                                            }`}
                                            disabled={paymentLoading}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={assets.razorpay_logo} alt="Razorpay" className="h-8 w-auto" />
                                                <span className="font-medium text-gray-800">Pay with Razorpay</span>
                                            </div>
                                            {paymentMethod === 'razorpay' && !paymentLoading && <CheckCircle2 size={20} className="text-primary" />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-8">
                                    <button 
                                        onClick={initiateBooking}
                                        disabled={paymentLoading || bookingLoading}
                                        className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {paymentLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Processing Payment...</span>
                                            </>
                                        ) : bookingLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Confirming Booking...</span>
                                            </>
                                        ) : paymentSuccess ? (
                                            <>
                                                <CheckCircle2 size={20} />
                                                <span>Payment Successful!</span>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard size={20} />
                                                <span>Pay & Confirm {currencySymbol}{selectedService?.price}</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                                        <Shield size={14} />
                                        Your payment information is securely processed
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="max-w-2xl mx-auto mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-yellow-800 mb-1">Cancellation Policy</h3>
                            <p className="text-sm text-yellow-700">
                                {slotSettings.allowRescheduling 
                                    ? `Free cancellation up to ${slotSettings.rescheduleHoursBefore} hours before your appointment.`
                                    : 'Please contact us for cancellation policy details.'
                                } After that, you may be charged a cancellation fee of 50% of the service price.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Appointment;
