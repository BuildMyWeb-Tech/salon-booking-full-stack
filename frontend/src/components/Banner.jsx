import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
    const navigate = useNavigate()

    return (
        <section className='w-full py-8 px-4 sm:px-6 md:px-8'>
            <div className='container mx-auto'>
                <div className='bg-primary rounded-xl overflow-hidden shadow-xl'>
                    <div className='flex flex-col md:flex-row'>
                        {/* Left Side - Content */}
                        <div className='w-full md:w-3/5 p-8 sm:p-10 lg:p-16'>
                            <div className='max-w-lg'>
                                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight'>
                                    Transform Your Look Today
                                </h2>
                                
                                <p className='text-white/90 mb-8 text-sm sm:text-base'>
                                    Join our community of satisfied clients and experience the magic of our award-winning stylists. Book your appointment now and enjoy premium styling services tailored to your unique needs.
                                </p>
                                
                                <div className='flex flex-col sm:flex-row gap-4'>
                                    <button 
                                        onClick={() => { 
                                            navigate('/login'); 
                                            scrollTo(0, 0); 
                                        }} 
                                        className='bg-white text-primary px-8 py-3.5 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300'
                                    >
                                        Create Account
                                    </button>
                                    
                                    <button 
                                        onClick={() => navigate('/stylists')} 
                                        className='border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-all duration-300'
                                    >
                                        Browse Stylists
                                    </button>
                                </div>
                                
                                <div className='mt-8 flex items-center gap-3'>
                                    <div className='flex -space-x-3'>
                                        {[1, 2, 3, 4].map(index => (
                                            <div key={index} className='w-10 h-10 rounded-full border-2 border-white overflow-hidden'>
                                                <img 
                                                    src={`/src/assets/doc${index}.png`} 
                                                    alt="Client" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className='text-white text-sm'>
                                        <p className='font-bold'>500+ Satisfied Clients</p>
                                        <p className='text-white/80 text-xs'>Join them today!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Side - Image */}
                        <div className='w-full md:w-2/5 relative'>
                            <div className='h-64 sm:h-80 md:h-full relative overflow-hidden'>
                                <img 
                                    className='w-full h-full object-cover object-center' 
                                    src={assets.appointment_img} 
                                    alt="Stylist appointment" 
                                />
                                <div className='absolute inset-0 bg-gradient-to-r from-primary to-transparent opacity-60 md:opacity-40'></div>
                            </div>
                            
                            {/* Floating element */}
                            <div className='absolute bottom-4 left-4 md:bottom-8 md:left-8 bg-white rounded-lg p-4 shadow-lg max-w-[220px] hidden sm:block'>
                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='font-semibold text-gray-800 text-sm'>Quick Booking</p>
                                        <p className='text-gray-500 text-xs'>Takes less than 2 minutes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Banner
