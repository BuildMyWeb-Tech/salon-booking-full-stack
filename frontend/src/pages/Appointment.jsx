import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
// import RelatedStylists from '../components/RelatedStylists';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Phone, Scissors, Star, Clock, Calendar, MapPin, CheckCircle } from "lucide-react";

const Appointment = () => {
    const { docId } = useParams(); // Keep original param name if your routes still use docId
    const { doctors: stylists, currencySymbol, backendUrl, token, getDoctosData: getStylesData } = useContext(AppContext);
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const [stylistInfo, setStylistInfo] = useState(null);
    const [stylistSlots, setStylistSlots] = useState([]);
    const [slotIndex, setSlotIndex] = useState(0);
    const [slotTime, setSlotTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const navigate = useNavigate();

    const services = [
        { id: 1, name: "Classic Haircut", price: 500, duration: "30 min" },
        { id: 2, name: "Hair Coloring", price: 1500, duration: "90 min" },
        { id: 3, name: "Styling & Blowout", price: 800, duration: "45 min" },
        { id: 4, name: "Treatment & Spa", price: 1200, duration: "60 min" },
    ];

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

    const bookAppointment = async () => {
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

        setBookingLoading(true);
        const date = stylistSlots[slotIndex][0].datetime;

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        const slotDate = day + "_" + month + "_" + year;

        try {
            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', 
                { docId, slotDate, slotTime, service: selectedService.name, price: selectedService.price }, 
                { headers: { token } }
            );
            
            if (data.success) {
                toast.success(data.message);
                getStylesData();
                navigate('/my-appointments');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error booking appointment');
        } finally {
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



    return (
        <div className="container mx-auto px-4 py-8">
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
                                    className="w-full aspect-square object-cover rounded-xl shadow-md" 
                                />
                                
                                {stylistInfo.available && (
                                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        Available Today
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4 flex flex-col sm:flex-row md:flex-col gap-2">
                                <button
                                    onClick={() => {
                                        if (stylistInfo?.phone) {
                                            window.location.href = `tel:${stylistInfo.phone}`;
                                        }
                                    }}
                                    disabled={!stylistInfo?.phone}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors
                                        ${stylistInfo?.phone 
                                        ? 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 cursor-pointer'
                                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                        }`}
                                >
                                    <Phone className="w-4 h-4" />
                                    {stylistInfo?.phone ? `Call ${stylistInfo.name}` : 'Contact'}
                                </button>
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
                                        <div className="flex items-center">
                                            <Star size={16} className="text-yellow-400 mr-1" />
                                            <span>{stylistInfo.rating || 4.8}</span>
                                        </div>
                                        <span className="hidden sm:inline text-gray-300">•</span>
                                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                            {stylistInfo.experience}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* About Section */}
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-800">About</h3>
                                    <Scissors size={14} className="text-primary" />
                                </div>
                                <p className="text-gray-600">{stylistInfo.about || "Professional hairstylist with expertise in modern cutting techniques, color services, and personalized styling. Dedicated to creating looks that enhance your natural beauty while keeping your hair healthy and manageable."}</p>
                            </div>
                            
                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Starting Price</div>
                                    <div className="text-xl font-bold text-gray-800 mt-1">{currencySymbol}{stylistInfo.price || stylistInfo.fees || 500}</div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Experience</div>
                                    <div className="text-xl font-bold text-gray-800 mt-1">{stylistInfo.experience}</div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Working Hours</div>
                                    <div className="text-xl font-bold text-gray-800 mt-1">{stylistInfo.WorkingHours || "9AM - 9PM"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Booking Section */}
                <div className="p-6 sm:p-8 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Book Your Styling Session</h2>
                    
                    {/* Services Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Service</label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {services.map((service) => (
                                <div 
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                        selectedService?.id === service.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-800">{service.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                <Clock size={14} className="inline mr-1" /> {service.duration}
                                            </p>
                                        </div>
                                        {selectedService?.id === service.id && (
                                            <CheckCircle size={18} className="text-primary" />
                                        )}
                                    </div>
                                    <div className="mt-3 font-bold text-gray-800">{currencySymbol}{service.price}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
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
                                            onClick={() => setSlotIndex(index)}
                                            className={`flex flex-col items-center p-4 min-w-[100px] rounded-xl cursor-pointer transition-all duration-200 ${
                                                slotIndex === index 
                                                    ? 'bg-primary text-white shadow-md' 
                                                    : 'border border-gray-200 hover:border-primary/50'
                                            }`}
                                        >
                                            <p className="text-xs font-medium mb-1">
                                                {isToday ? 'TODAY' : daysOfWeek[date.getDay()]}
                                            </p>
                                            <p className="text-2xl font-bold">{date.getDate()}</p>
                                            <p className="text-xs mt-1">{monthNames[date.getMonth()]}</p>
                                            <p className="text-xs mt-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                {slots.length} slots
                                            </p>
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
                                                ? 'bg-primary text-white shadow-sm' 
                                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {slot.time.toLowerCase()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Booking Summary */}
                    {selectedService && slotTime && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-medium text-gray-800 mb-3">Booking Summary</h3>
                            
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Stylist</span>
                                    <span className="font-medium">{stylistInfo.name}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Service</span>
                                    <span className="font-medium">{selectedService.name}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date</span>
                                    <span className="font-medium">
                                        {stylistSlots[slotIndex][0].datetime.toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Time</span>
                                    <span className="font-medium">{slotTime}</span>
                                </div>
                                
                                <div className="flex justify-between pt-2 border-t border-gray-200 mt-1">
                                    <span className="text-gray-600">Fee</span>
                                    <span className="font-bold">{currencySymbol}{selectedService.price}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="flex justify-center">
                        <button 
                            onClick={bookAppointment} 
                            disabled={bookingLoading || !slotTime || !selectedService}
                            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-12 py-3 rounded-full font-medium transition-all ${
                                !slotTime || !selectedService
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg'
                            }`}
                        >
                            {bookingLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Book Appointment</span>
                                    <Calendar size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Related Stylists Section */}
            {/* <div className="mt-12">
                <RelatedStylists speciality={stylistInfo.speciality} stylistId={stylistId} />
            </div> */}
        </div>
    );
};

export default Appointment;
