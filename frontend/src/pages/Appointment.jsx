import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
// import { useRazorpay } from 'react-razorpay';
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
    const [stylistSlots, setStylistSlots] = useState([]);
    const [slotIndex, setSlotIndex] = useState(0);
    const [slotTime, setSlotTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

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


    // Dynamically loaded services based on stylist's specialty
    const getServicesBySpeciality = (speciality) => {
      const baseServices = [
        { id: 1, name: "Classic Haircut", price: 500, duration: "30 min" },
        { id: 2, name: "Styling & Blowout", price: 800, duration: "45 min" },
      ];
      
      const specialityServices = {
        'Hair Styling Specialist': [
          { id: 3, name: "Premium Style Cut", price: 1200, duration: "60 min" },
          { id: 4, name: "Hair Texture Service", price: 1800, duration: "90 min" },
        ],
        'Hair Coloring Specialist': [
          { id: 5, name: "Root Touch-up", price: 1500, duration: "60 min" },
          { id: 6, name: "Full Color", price: 2500, duration: "120 min" },
          { id: 7, name: "Highlights", price: 3000, duration: "150 min" },
        ],
        'Beard & Grooming Specialist': [
          { id: 8, name: "Beard Trim & Shape", price: 400, duration: "20 min" },
          { id: 9, name: "Luxury Shave", price: 800, duration: "40 min" },
          { id: 10, name: "Beard Color", price: 1200, duration: "45 min" },
        ],
        'Hair Treatment Specialist': [
          { id: 11, name: "Deep Conditioning", price: 1000, duration: "45 min" },
          { id: 12, name: "Scalp Treatment", price: 1500, duration: "60 min" },
          { id: 13, name: "Keratin Treatment", price: 4000, duration: "180 min" },
        ],
        'Bridal Hairstylist': [
          { id: 14, name: "Bridal Trial", price: 2000, duration: "90 min" },
          { id: 15, name: "Wedding Day Style", price: 5000, duration: "120 min" },
          { id: 16, name: "Bridesmaid Style", price: 2500, duration: "60 min" },
        ],
        'Unisex Hairstylist': [
          { id: 17, name: "Men's Haircut", price: 400, duration: "30 min" },
          { id: 18, name: "Women's Haircut", price: 700, duration: "45 min" },
          { id: 19, name: "Kids Haircut", price: 300, duration: "30 min" },
        ],
      };
      
      return [
        ...baseServices,
        ...(specialityServices[speciality] || [])
      ];
    };

    const fetchStylistInfo = async () => {
        const stylistInfo = stylists.find((stylist) => stylist._id === docId);
        setStylistInfo(stylistInfo);
    };

    const getAvailableSlots = async () => {
        if (!stylistInfo) return;
        
        setLoading(true);
        setStylistSlots([]);

        // getting current date
        let today = new Date();

        for (let i = 0; i < 7; i++) {
            // getting date with index 
            let currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            // setting end time of the date with index
            let endTime = new Date();
            endTime.setDate(today.getDate() + i);
            endTime.setHours(21, 0, 0, 0);

            // setting hours 
            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 8 ? currentDate.getHours() + 1 : 8);
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
            } else {
                currentDate.setHours(8);
                currentDate.setMinutes(0);
            }

            let timeSlots = [];

            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let day = currentDate.getDate();
                let month = currentDate.getMonth() + 1;
                let year = currentDate.getFullYear();

                const slotDate = day + "_" + month + "_" + year;
                const slotTime = formattedTime;

                // Fix the error by checking if slots_booked exists
                const isSlotBooked = 
                    stylistInfo.slots_booked && 
                    stylistInfo.slots_booked[slotDate] && 
                    stylistInfo.slots_booked[slotDate].includes(slotTime);
                
                if (!isSlotBooked) {
                    // Add slot to array
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    });
                }

                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setStylistSlots(prev => ([...prev, timeSlots]));
        }
        setLoading(false);
    };

    const handlePayment = async () => {
  const res = await loadRazorpayScript();
  if (!res) {
    alert("Razorpay SDK failed to load");
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,  // ✅ Correct for Vite
    amount: amount * 100,
    currency: "INR",
    name: "Salon Booking",
    description: "Service Payment",
    handler: function (response) {
      console.log("Payment Success:", response);
      confirmBooking(response.razorpay_payment_id);
    },
    prefill: {
      name: user?.name,
      email: user?.email,
    },
    theme: {
      color: "#4F46E5",
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};


    const initiateBooking = () => {
        if (!token) {
            toast.warning('Login to book appointment');
            return navigate('/login');
        }

        if (!slotTime) {
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
                // Razorpay payment flow
                const options = {
                    key: razorpayKeyId,
                    amount: selectedService.price * 100, // Razorpay expects amount in smallest currency unit
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
                
                const rzpay = new Razorpay(options);
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

    const completeBooking = async (paymentMethod) => {
        setBookingLoading(true);
        const date = stylistSlots[slotIndex][0].datetime;

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        const slotDate = day + "_" + month + "_" + year;

        try {
            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', 
                { 
                    docId, 
                    slotDate, 
                    slotTime, 
                    service: selectedService.name, 
                    price: selectedService.price,
                    paymentMethod: paymentMethod
                }, 
                { headers: { token } }
            );
            
            if (data.success) {
                toast.success(data.message);
                getStylesData();
                
                // Set timeout to show success message before redirecting
                setTimeout(() => {
                    setBookingLoading(false);
                    setShowPaymentModal(false);
                    navigate('/my-appointments');
                }, 2000);
            } else {
                toast.error(data.message);
                setBookingLoading(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error booking appointment');
            setBookingLoading(false);
        }
    };

    useEffect(() => {
        if (stylists && stylists.length > 0) {
            fetchStylistInfo();
        }
    }, [stylists, docId]);

    useEffect(() => {
        if (stylistInfo) {
            getAvailableSlots();
        }
    }, [stylistInfo]);

    if (!stylistInfo) {
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
                                            Available Today
                                        </div>
                                    )}
                                    
                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border shadow-sm px-3 py-1 rounded-full flex items-center gap-1">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="font-semibold text-gray-800">{stylistInfo.rating || "4.8"}</span>
                                        <span className="text-gray-500 text-xs">({stylistInfo.reviewCount || "124"})</span>
                                    </div>
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
                                    <p className="text-gray-600">{stylistInfo.about || "Professional hairstylist with expertise in modern cutting techniques, color services, and personalized styling. Dedicated to creating looks that enhance your natural beauty while keeping your hair healthy and manageable."}</p>
                                </div>
                                
                                {/* Details Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-primary/20">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Scissors size={14} className="text-primary" />
                                            Starting Price
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">{currencySymbol}{stylistInfo.price || stylistInfo.fees || 500}</div>
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-primary/20">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Award size={14} className="text-primary" />
                                            Experience
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">{stylistInfo.experience}</div>
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-primary/20">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Clock size={14} className="text-primary" />
                                            Working Hours
                                        </div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">{stylistInfo.workingHours || "8AM - 9PM"}</div>
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
                                                    <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
                                                        <Clock size={14} className="text-gray-400" /> 
                                                        {service.duration}
                                                    </p>
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
                                            <p className="text-sm text-gray-500">{selectedService?.duration}</p>
                                        </div>
                                        <div className="text-lg font-bold text-primary">{currencySymbol}{selectedService?.price}</div>
                                    </div>
                                </div>
                            
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Select Date & Time</h2>
                                
                                {/* Date Selection */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
                                    
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 items-center overflow-x-auto pb-2">
                                            {stylistSlots.map((slots, index) => {
                                                if (slots.length === 0) return null;
                                                
                                                const date = slots[0].datetime;
                                                const isToday = new Date().getDate() === date.getDate() && 
                                                            new Date().getMonth() === date.getMonth();
                                                
                                                return (
                                                    <div 
                                                        key={index} 
                                                        onClick={() => {
                                                            setSlotIndex(index);
                                                            setSlotTime(''); // Reset time when date changes
                                                        }}
                                                        className={`flex flex-col items-center p-4 min-w-[110px] rounded-xl cursor-pointer transition-all duration-200 ${
                                                            slotIndex === index 
                                                                ? 'bg-primary text-white shadow-md' 
                                                                : 'border border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <p className="text-xs font-medium mb-1">
                                                            {isToday ? 'TODAY' : daysOfWeek[date.getDay()]}
                                                        </p>
                                                        <p className="text-2xl font-bold">{date.getDate()}</p>
                                                        <p className="text-xs mt-1">{monthNames[date.getMonth()]}</p>
                                                        <div className={`text-xs mt-2 px-2 py-0.5 rounded-full ${
                                                            slotIndex === index 
                                                                ? 'bg-white/20 text-white' 
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {slots.length} slots
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Time Selection */}
                                {stylistSlots.length > 0 && stylistSlots[slotIndex] && stylistSlots[slotIndex].length > 0 && (
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Time</label>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {stylistSlots[slotIndex].map((slot, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setSlotTime(slot.time)}
                                                    className={`py-3 px-4 text-center rounded-lg cursor-pointer transition-all ${
                                                        slot.time === slotTime 
                                                            ? 'bg-primary text-white shadow-md' 
                                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100'
                                                    }`}
                                                >
                                                    {slot.time}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Action Button */}
                                <div className="mt-8 flex justify-end">
                                    <button 
                                        onClick={() => {
                                            if (slotTime) {
                                                setCurrentStep(3);
                                            } else {
                                                toast.warning("Please select a time slot");
                                            }
                                        }}
                                        disabled={!slotTime}
                                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                            !slotTime
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
                                
                                {/* Booking Summary */}
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
                                                <p className="text-sm text-gray-500">{selectedService?.duration}</p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-gray-600 text-sm">Date & Time</span>
                                                <p className="font-medium text-gray-800">
                                                    {stylistSlots[slotIndex][0].datetime.toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-500">{slotTime}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-lg">
                                            <span className="font-medium text-gray-800">Total Amount</span>
                                            <span className="font-bold text-gray-900">{currencySymbol}{selectedService?.price}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Payment Methods */}
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
                                
                                {/* Action Button */}
                                <div className="mt-8">
                                    <button 
                                        onClick={initiateBooking}
                                        disabled={paymentLoading || bookingLoading}
                                        /* Action Button continued */
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
                
                {/* Cancellation Policy */}
                <div className="max-w-2xl mx-auto mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-yellow-800 mb-1">Cancellation Policy</h3>
                            <p className="text-sm text-yellow-700">
                                Free cancellation up to 3 hours before your appointment. After that, 
                                you may be charged a cancellation fee of 50% of the service price.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* CSS animations */}
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
