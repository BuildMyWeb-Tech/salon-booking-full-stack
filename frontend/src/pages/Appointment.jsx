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
  AlertTriangle,
  ChevronRight,
  Heart,
  Sparkles,
  MessageCircle,
  Info,
  Clock4,
  BadgeCheck,
  Copy
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
    const [dateRange, setDateRange] = useState([]);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);

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
            { id: 1, name: "Classic Haircut", price: 500, duration: "30 min", description: "Traditional haircut with styling" },
            { id: 2, name: "Styling & Blowout", price: 800, duration: "45 min", description: "Professional styling with blowout" },
        ];
        
        const specialityServices = {
            "Hair Styling Specialist": [
                { id: 3, name: "Premium Style Cut", price: 1200, duration: "60 min", description: "Premium styling with expert consultation" },
                { id: 4, name: "Hair Texture Service", price: 1800, duration: "90 min", description: "Complete texture transformation" },
            ],
            "Hair Coloring Specialist": [
                { id: 5, name: "Root Touch-up", price: 1500, duration: "60 min", description: "Perfect for covering regrowth" },
                { id: 6, name: "Full Color", price: 2500, duration: "120 min", description: "Complete hair color transformation" },
                { id: 7, name: "Highlights", price: 3000, duration: "150 min", description: "Dimensional highlights for natural look" },
            ],
            "Beard & Grooming Specialist": [
                { id: 8, name: "Beard Trim & Shape", price: 400, duration: "20 min", description: "Precise beard shaping and styling" },
                { id: 9, name: "Luxury Shave", price: 800, duration: "45 min", description: "Traditional hot towel shave experience" },
                { id: 10, name: "Beard Color", price: 1200, duration: "45 min", description: "Color service for beards" },
            ],
            "Hair Treatment Specialist": [
                { id: 11, name: "Deep Conditioning", price: 1000, duration: "45 min", description: "Intensive repair for damaged hair" },
                { id: 12, name: "Scalp Treatment", price: 1500, duration: "60 min", description: "Focus on scalp health" },
                { id: 13, name: "Keratin Treatment", price: 4000, duration: "180 min", description: "Long-lasting smoothing solution" },
            ],
            "Bridal Hairstylist": [
                { id: 14, name: "Bridal Trial", price: 2000, duration: "90 min", description: "Practice session before wedding day" },
                { id: 15, name: "Wedding Day Style", price: 5000, duration: "120 min", description: "Complete bridal hair styling" },
                { id: 16, name: "Bridesmaid Style", price: 2500, duration: "60 min", description: "Perfect styling for bridesmaids" },
            ],
            "Unisex Hairstylist": [
                { id: 17, name: "Men's Haircut", price: 400, duration: "30 min", description: "Classic men's cut and style" },
                { id: 18, name: "Women's Haircut", price: 700, duration: "45 min", description: "Women's cut with styling" },
                { id: 19, name: "Kids Haircut", price: 300, duration: "20 min", description: "Gentle styling for children" },
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
                maxAdvanceBookingDays: 7,
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

    // Generate date range for the calendar
    const generateDateRange = () => {
        const today = new Date();
        const range = [];
        
        const maxDays = slotSettings?.maxAdvanceBookingDays || 7;
        
        for (let i = 0; i < maxDays; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            
            // Format the date object to include day of week, date, month
            const day = daysOfWeek[date.getDay()];
            const dateNum = date.getDate();
            const month = monthNames[date.getMonth()];
            
            range.push({
                label: i === 0 ? 'TODAY' : day,
                date: dateNum,
                month: month,
                fullDate: new Date(date),
                slots: Math.floor(Math.random() * 15) + 5, // Random number of slots for demo
            });
        }
        
        return range;
    };

    useEffect(() => {
        fetchSlotSettings();
    }, []);

    useEffect(() => {
        if (stylists && stylists.length > 0) {
            fetchStylistInfo();
        }
    }, [stylists, docId]);

    useEffect(() => {
        if (slotSettings) {
            const dateRange = generateDateRange();
            setDateRange(dateRange);
            
            // Set today as default selected date
            setSelectedDate(dateRange[0].fullDate);
            fetchSlots(dateRange[0].fullDate);
        }
    }, [slotSettings]);

    const handleDateSelect = (date, index) => {
        setSelectedDateIndex(index);
        setSelectedDate(date.fullDate);
        setSelectedSlotISO('');
        fetchSlots(date.fullDate);
    };

    if (!stylistInfo || !slotSettings) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Get services based on stylist specialty
    const services = getServicesBySpeciality(stylistInfo.speciality);

    const formatTimeDisplay = (timeString) => {
        // Convert 24hr format to 12hr format
        const [hour, minute] = timeString.split(':').map(Number);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header area with subtle pattern background */}
            <div className="bg-gradient-to-r from-primary/90 to-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors mr-4"
                        >
                            <ChevronLeft size={22} className="text-white" />
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Book Your Appointment</h1>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    {/* Stylist Profile Section */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 sm:p-8 relative">
                        {/* Premium badge if applicable */}
                        {stylistInfo.experience && parseInt(stylistInfo.experience) > 5 && (
                            <div className="absolute top-6 right-6 bg-yellow-500/90 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
                                <Sparkles size={12} />
                                Premium Stylist
                            </div>
                        )}
                        
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Profile Image */}
                            <div className="md:w-1/4 lg:w-1/5">
                                <div className="relative">
                                    <div className="rounded-xl overflow-hidden border-4 border-white shadow-lg">
                                        <img 
                                            src={stylistInfo.image} 
                                            alt={stylistInfo.name} 
                                            className="w-full aspect-square object-cover transition-all hover:scale-105 duration-700" 
                                        />
                                    </div>
                                    
                                    {stylistInfo.available && (
                                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Available 
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-6 space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    {stylistInfo?.phone && (
                                        <a
                                            href={`tel:${stylistInfo.phone}`}
                                            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
                                        >
                                            <Phone size={16} className="text-primary" />
                                            <span>{stylistInfo.phone}</span>
                                        </a>
                                    )}
                                    
                                    {stylistInfo?.email && (
                                        <a
                                            href={`mailto:${stylistInfo.email}`}
                                            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
                                        >
                                            <Mail size={16} className="text-primary" />
                                            <span className="truncate">{stylistInfo.email}</span>
                                        </a>
                                    )}
                                    
                                    {stylistInfo?.instagram && (
                                        <a
                                            href={`https://instagram.com/${stylistInfo.instagram}`}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
                                        >
                                            <Instagram size={16} className="text-pink-500" />
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
                                            <BadgeCheck size={22} className="text-primary" />
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-gray-600">
                                            <p className="text-primary font-medium flex items-center gap-1">
                                                <Scissors size={14} />
                                                {stylistInfo.speciality}
                                            </p>
                                            <span className="hidden sm:inline text-gray-300">•</span>
                                            <div className="flex items-center gap-1">
                                                <Award size={16} className="text-primary/80" />
                                                <span>{stylistInfo.experience}</span>
                                            </div>
                                            <span className="hidden sm:inline text-gray-300">•</span>
                                            <div className="flex items-center gap-1">
                                                <Star size={16} fill="#FFD700" className="text-yellow-400" />
                                                <span className="font-medium">4.9</span>
                                                <span className="text-gray-500">(120)</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button className="flex items-center gap-1.5 text-gray-600 bg-white px-3 py-1.5 rounded-full text-sm border border-gray-200 hover:text-rose-500 hover:border-rose-200 transition-colors shadow-sm">
                                        <Heart size={16} />
                                        <span>Favorite</span>
                                    </button>
                                </div>
                                
                                {/* About Section */}
                                <div className="mt-6 bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-800">About</h3>
                                        <User size={14} className="text-primary" />
                                    </div>
                                    <p className="text-gray-600">{stylistInfo.about || "Professional hairstylist with expertise in modern cutting techniques, color services, and personalized styling. I focus on creating looks that enhance your natural beauty while ensuring hair health and manageability."}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Scissors size={14} className="text-primary group-hover:scale-110 transition-transform" />
                                            Starting Price
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">{currencySymbol}{stylistInfo.price || stylistInfo.fees || 500}</div>
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Award size={14} className="text-primary group-hover:scale-110 transition-transform" />
                                            Experience
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">{stylistInfo.experience}</div>
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Clock size={14} className="text-primary group-hover:scale-110 transition-transform" />
                                            Working Hours
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">
                                            {formatTimeDisplay(slotSettings.slotStartTime)} - {formatTimeDisplay(slotSettings.slotEndTime)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Booking Steps Indicator */}
                    <div className="px-6 sm:px-8 py-5 border-b border-gray-200 bg-white">
                        <div className="flex items-center justify-between max-w-3xl mx-auto">
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${currentStep >= 1 ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                                    1
                                </div>
                                <div className={`h-1 w-12 sm:w-20 transition-all duration-500 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${currentStep >= 2 ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                                    2
                                </div>
                                <div className={`h-1 w-12 sm:w-20 transition-all duration-500 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${currentStep >= 3 ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                                    3
                                </div>
                            </div>
                            <div className="hidden sm:flex text-sm text-gray-600 space-x-8">
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
                                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <Scissors size={20} className="text-primary" />
                                    Select Service
                                </h2>
                                <p className="text-gray-500 mb-6">Choose from our range of expert styling services</p>
                                
                                {/* Services Selection */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                                    {services.map((service) => (
                                        <div 
                                            key={service.id}
                                            onClick={() => {
                                                setSelectedService(service);
                                                setCurrentStep(2);
                                            }}
                                            className={`p-5 rounded-xl cursor-pointer transition-all hover:-translate-y-1 ${
                                                selectedService?.id === service.id
                                                    ? 'border-2 border-primary bg-primary/5 shadow-md'
                                                    : 'border border-gray-200 hover:border-primary/30 hover:shadow-md bg-white'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-lg">{service.name}</h3>
                                                    <p className="text-gray-500 text-sm mt-1">{service.description}</p>
                                                </div>
                                                {selectedService?.id === service.id ? (
                                                    <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>
                                                )}
                                            </div>
                                            
                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                                <div>
                                                    <span className="font-bold text-gray-800 text-lg">{currencySymbol}{service.price}</span>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Clock4 size={12} />
                                                        {service.duration}
                                                    </div>
                                                </div>
                                                <button className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                                                    selectedService?.id === service.id 
                                                    ? 'bg-primary text-white' 
                                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                                }`}>
                                                    {selectedService?.id === service.id ? 'Selected' : 'Select'}
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
                                <div className="bg-white p-5 rounded-xl border border-primary/20 mb-6 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-800">{selectedService?.name}</h3>
                                                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">Selected</span>
                                            </div>
                                            <p className="text-gray-500 text-sm">{selectedService?.description}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1 text-gray-600 text-sm">
                                                    <Clock4 size={14} className="text-primary" />
                                                    {selectedService?.duration}
                                                </div>
                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                <div className="flex items-center gap-1 text-gray-600 text-sm">
                                                    <Scissors size={14} className="text-primary" />
                                                    {stylistInfo.speciality}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-primary">{currencySymbol}{selectedService?.price}</div>
                                    </div>
                                </div>
                            
                                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <Calendar size={20} className="text-primary" />
                                    Select Date & Time
                                </h2>
                                <p className="text-gray-500 mb-6">Choose when you'd like to schedule your appointment</p>
                                
                                {/* Date Selection - New Calendar Strip UI */}
                                <div className="mb-8">
                                    <div className="flex overflow-x-auto pb-2 space-x-3 snap-x scrollbar-hide">
                                        {dateRange.map((date, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleDateSelect(date, index)}
                                                className={`flex-shrink-0 snap-start w-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                                    selectedDateIndex === index
                                                        ? 'border-primary shadow-md'
                                                        : 'border-gray-100'
                                                }`}
                                            >
                                                <div className={`py-2 px-2 text-center ${
                                                    selectedDateIndex === index 
                                                        ? 'bg-primary text-white' 
                                                        : 'bg-gray-50 text-gray-700'
                                                }`}>
                                                    <div className="text-xs font-medium">{date.label}</div>
                                                </div>
                                                <div className={`py-3 text-center ${
                                                    selectedDateIndex === index 
                                                        ? 'bg-white' 
                                                        : 'bg-white'
                                                }`}>
                                                    <div className={`text-xl font-bold ${
                                                        selectedDateIndex === index 
                                                            ? 'text-primary' 
                                                            : 'text-gray-800'
                                                    }`}>{date.date}</div>
                                                    <div className="text-xs text-gray-500">{date.month}</div>
                                                    <div className={`mt-1 text-xs ${
                                                        date.slots > 10 
                                                            ? 'text-green-600 bg-green-50' 
                                                            : date.slots > 5 
                                                                ? 'text-blue-600 bg-blue-50' 
                                                                : 'text-orange-600 bg-orange-50'
                                                    } rounded-full px-2 py-0.5 inline-block`}>
                                                        {date.slots} slots
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Alternative date selection method */}
                                    <div className="mt-4 flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-500">Or select a specific date:</span>
                                        <input
                                            type="date"
                                            className="border rounded-lg px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const date = new Date(e.target.value);
                                                    setSelectedDate(date);
                                                    setSelectedSlotISO('');
                                                    setSelectedDateIndex(-1); // Reset calendar strip selection
                                                    fetchSlots(date);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Time Selection */}
                                {selectedDate && (
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <Clock size={16} className="text-primary" />
                                                Available Times for {selectedDate.toLocaleDateString('en-US', { 
                                                    weekday: 'long', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </label>
                                                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                {slotSettings.slotDuration} min slots
                                            </span>
                                        </div>
                                        
                                        {loading ? (
                                            <div className="flex justify-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full mb-3"></div>
                                                    <p className="text-gray-500">Loading available slots...</p>
                                                </div>
                                            </div>
                                        ) : availableSlots.length === 0 ? (
                                            <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                                                <div className="bg-gray-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
                                                    <Clock size={28} className="text-gray-400" />
                                                </div>
                                                <h3 className="text-gray-700 font-medium mb-1">No slots available</h3>
                                                <p className="text-gray-500 max-w-md mx-auto">
                                                    There are no available appointment times for this date. Please select another day or contact us directly.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                    {availableSlots.map((slot, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => setSelectedSlotISO(slot.startTime)}
                                                            className={`py-3 px-4 text-center rounded-lg cursor-pointer transition-all border ${
                                                                slot.startTime === selectedSlotISO 
                                                                    ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
                                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-100 hover:border-gray-200'
                                                            }`}
                                                        >
                                                            <span className="font-medium">{slot.displayTime}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="flex items-center mt-4 pt-3 border-t border-gray-100 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Info size={14} className="text-primary" />
                                                        <span>All times shown in your local timezone.</span>
                                                    </div>
                                                </div>
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
                                                : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg transform hover:-translate-y-0.5'
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
                                
                                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <CreditCard size={20} className="text-primary" />
                                    Review and Pay
                                </h2>
                                <p className="text-gray-500 mb-6">Confirm your appointment details and complete your booking</p>
                                
                                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-primary" />
                                        Appointment Summary
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                                            <div>
                                                <span className="text-gray-600 text-sm">Stylist</span>
                                                <p className="font-medium text-gray-800">{stylistInfo.name}</p>
                                                <p className="text-xs text-primary mt-0.5">{stylistInfo.speciality}</p>
                                            </div>
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                                <img src={stylistInfo.image} alt={stylistInfo.name} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                                <span className="text-gray-600 text-xs flex items-center gap-1">
                                                    <Scissors size={12} className="text-primary" />
                                                    Service
                                                </span>
                                                <p className="font-medium text-gray-800">{selectedService?.name}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <Clock4 size={12} className="text-primary" />
                                                    {selectedService?.duration}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                                <span className="text-gray-600 text-xs flex items-center gap-1">
                                                    <Calendar size={12} className="text-primary" />
                                                    Date & Time
                                                </span>
                                                <p className="font-medium text-gray-800">
                                                    {selectedDate.toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Clock size={12} className="text-primary" />
                                                    {selectedSlotISO ? new Date(selectedSlotISO).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : selectedSlotISO}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-lg bg-primary/5 p-3 rounded-lg">
                                            <span className="font-medium text-gray-800">Total Amount</span>
                                            <span className="font-bold text-primary text-xl">{currencySymbol}{selectedService?.price}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-800 flex items-center gap-2">
                                        <CreditCard size={16} className="text-primary" />
                                        Select Payment Method
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setPaymentMethod('stripe')}
                                            className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                                                paymentMethod === 'stripe'
                                                    ? 'border-primary bg-primary/5 shadow-md'
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
                                                    ? 'border-primary bg-primary/5 shadow-md'
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
                                        disabled={paymentLoading || bookingLoading || !paymentMethod}
                                        className={`w-full py-4 rounded-xl font-medium transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 ${
                                            !paymentMethod 
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                : paymentLoading || bookingLoading 
                                                    ? 'bg-primary/80 text-white cursor-wait' 
                                                    : paymentSuccess 
                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                        : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg transform hover:-translate-y-0.5'
                                        }`}
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
                                        <Shield size={14} className="text-primary" />
                                        Your payment information is securely processed
                                    </p>
                                </div>

                                <div className="mt-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center justify-between text-sm text-gray-600 cursor-pointer hover:text-primary transition-colors">
                                        <span>Want to add this appointment to your calendar?</span>
                                        <Copy size={16} />
                                    </div>
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

                {/* Customer testimonial */}
                <div className="max-w-2xl mx-auto mt-6 bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <MessageCircle size={18} className="text-primary" />
                        <h3 className="font-medium text-gray-800">What our customers say</h3>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                            {/* Placeholder for customer image - don't identify */}
                            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10"></div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <Star key={i} size={14} fill="#FFD700" className="text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-600 text-sm italic">
                                "Such a professional experience! My stylist understood exactly what I wanted and delivered beyond my expectations. Will definitely be back!"
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                                Recent customer • {new Date().toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}
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
                .bg-pattern {
                    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .scrollbar-hide {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    );
};

export default Appointment;
