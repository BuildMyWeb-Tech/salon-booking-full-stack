import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Star, Clock, Award, Scissors, CalendarCheck, ArrowRight } from 'lucide-react'

const TopDoctors = () => {
    const navigate = useNavigate()
    const { doctors: stylists } = useContext(AppContext)

    return (
        <section className='w-full py-16 px-4 sm:px-6 md:px-8 bg-gray-50'>
            <div className='container mx-auto'>
                <div className='text-center max-w-3xl mx-auto mb-12'>
                    <h2 className='text-3xl sm:text-4xl font-bold text-gray-800 mb-4'>Featured Stylists</h2>
                    
                    <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
                    
                    <p className='text-gray-600'>
                        Book your Favourite Sylist with your Choice with your Flexible Time 
                    </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'>
                    {stylists.slice(0, 8).map((stylist, index) => (
                        <div 
                            key={index}
                            className='bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transform hover:-translate-y-2 transition-all duration-500 group'
                        >
                            {/* Image with Available Badge */}
                            <div className='relative overflow-hidden h-64'>
                                <img 
                                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' 
                                    src={stylist.image} 
                                    alt={stylist.name} 
                                />
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                                    stylist.available 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {stylist.available ? 'Available' : 'Not Available'}
                                </div>
                                
                                {/* Gradient overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            
                            <div className='p-5'>
                                <div className='flex justify-between items-center mb-3'>
                                    <h3 className='text-lg font-semibold text-gray-800'>{stylist.name}</h3>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className='flex items-center gap-2 text-sm text-primary font-medium'>
                                        <Scissors size={16} />
                                        <span>{stylist.speciality || "Hair Styling Specialist"}</span>
                                    </div>
                                    
                                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                                        <Clock size={16} />
                                        <span>{stylist.experience || "1 Year"} Experience</span>
                                    </div>
                                </div>
                                
                                {/* <div className='flex items-center gap-1 mb-4'>
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={16} 
                                            className={`${i < (stylist.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                    <span className='ml-2 text-xs text-gray-500'>
                                        ({stylist.reviews || '28'} reviews)
                                    </span>
                                </div> */}
                                
                                <button 
                                    onClick={() => { 
                                        navigate(`/appointment/${stylist._id}`); 
                                        scrollTo(0, 0); 
                                    }} 
                                    className='w-full py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2'
                                >
                                    <CalendarCheck size={16} />
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className='flex justify-center mt-12'>
                    <button 
                        onClick={() => { 
                            navigate('/stylists'); 
                            scrollTo(0, 0);
                        }} 
                        className='bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors px-10 py-3 rounded-full font-medium flex items-center gap-2'
                    >
                        View All Stylists
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default TopDoctors
