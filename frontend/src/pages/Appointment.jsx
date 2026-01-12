import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {
    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [loading, setLoading] = useState(false)
    const [bookingLoading, setBookingLoading] = useState(false)

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    const getAvailableSolts = async () => {
        setLoading(true)
        setDocSlots([])

        // getting current date
        let today = new Date()

        for (let i = 0; i < 7; i++) {
            // getting date with index 
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            // setting end time of the date with index
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(21, 0, 0, 0)

            // setting hours 
            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
            } else {
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }

            let timeSlots = [];

            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = day + "_" + month + "_" + year
                const slotTime = formattedTime

                const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

                if (isSlotAvailable) {
                    // Add slot to array
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    })
                }

                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlots]))
        }
        setLoading(false)
    }

    const bookAppointment = async () => {
        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        if (!slotTime) {
            return toast.warning('Please select a time slot')
        }

        setBookingLoading(true)
        const date = docSlots[slotIndex][0].datetime

        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        const slotDate = day + "_" + month + "_" + year

        try {
            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', 
                { docId, slotDate, slotTime }, 
                { headers: { token } }
            )
            
            if (data.success) {
                toast.success(data.message)
                getDoctosData()
                navigate('/my-appointments')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message || 'Error booking appointment')
        } finally {
            setBookingLoading(false)
        }
    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
        }
    }, [docInfo])

    if (!docInfo) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
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
                                    src={docInfo.image} 
                                    alt={docInfo.name} 
                                    className="w-full aspect-square object-cover rounded-xl shadow-md" 
                                />
                                
                                {docInfo.available && (
                                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        Available Today
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4 flex flex-col sm:flex-row md:flex-col gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Contact
                                </button>
                                
                                
                            </div>
                        </div>
                        
                        {/* Profile Info */}
                        <div className="md:w-3/4 lg:w-4/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{docInfo.name}</h1>
                                        <img className="w-6 h-6" src={assets.verified_icon} alt="Verified" />
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-gray-600">
                                        <p className="text-primary font-medium">{docInfo.speciality}</p>
                                        <span className="hidden sm:inline text-gray-300">•</span>
                                        <p>{docInfo.degree}</p>
                                        <span className="hidden sm:inline text-gray-300">•</span>
                                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                            {docInfo.experience}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg 
                                            key={star} 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className={`h-5 w-5 ${star <= (docInfo.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                            viewBox="0 0 20 20" 
                                            fill="currentColor"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="text-sm text-gray-500 ml-1">(76 reviews)</span>
                                </div>
                            </div>
                            
                            {/* About Section */}
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-800">About</h3>
                                    <img className="w-4 h-4" src={assets.info_icon} alt="" />
                                </div>
                                <p className="text-gray-600">{docInfo.about}</p>
                            </div>
                            
                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Appointment Fee</div>
                                    <div className="text-xl font-bold text-gray-800 mt-1">{currencySymbol}{docInfo.fees}</div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Experience</div>
                                    <div className="text-xl font-bold text-gray-800 mt-1">{docInfo.experience}</div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Services</div>
                                    <div className="text-xl font-bold text-gray-800 mt-1">25+ Services</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Booking Section */}
                <div className="p-6 sm:p-8 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Book Your Appointment</h2>
                    
                    {/* Date Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
                        
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="flex gap-3 items-center overflow-x-auto pb-2">
                                {docSlots.map((slots, index) => {
                                    if (slots.length === 0) return null
                                    
                                    const date = slots[0].datetime
                                    const isToday = new Date().getDate() === date.getDate() && 
                                                  new Date().getMonth() === date.getMonth()
                                    
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
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    
                    {/* Time Selection */}
                    {docSlots.length > 0 && docSlots[slotIndex] && docSlots[slotIndex].length > 0 && (
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Select Time</label>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {docSlots[slotIndex].map((slot, index) => (
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
                    {slotTime && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-medium text-gray-800 mb-3">Booking Summary</h3>
                            
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Stylist</span>
                                    <span className="font-medium">{docInfo.name}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Service</span>
                                    <span className="font-medium">{docInfo.speciality}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date</span>
                                    <span className="font-medium">
                                        {docSlots[slotIndex][0].datetime.toLocaleDateString('en-US', { 
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
                                    <span className="font-bold">{currencySymbol}{docInfo.fees}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="flex justify-center">
                        <button 
                            onClick={bookAppointment} 
                            disabled={bookingLoading || !slotTime}
                            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-12 py-3 rounded-full font-medium transition-all ${
                                !slotTime 
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
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Related Stylists Section */}
            <div className="mt-12">
                <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
            </div>
        </div>
    )
}

export default Appointment
