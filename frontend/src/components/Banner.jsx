import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion' // Add framer-motion for animations

const Banner = () => {
    const navigate = useNavigate()
    const [isVisible, setIsVisible] = useState(false)

    // Services offered by the hairstylists
    const services = [
        "Haircuts", "Styling", "Coloring", "Treatments", "Extensions"
    ]

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <section className='w-full py-8 px-4 sm:px-6 md:px-8 bg-gray-50'>
            <div className='container mx-auto'>
                <motion.div 
                    className='bg-gradient-to-r from-primary via-purple-600 to-indigo-600 rounded-2xl overflow-hidden shadow-2xl relative'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className='flex flex-col lg:flex-row'>
                        {/* Left Side - Content */}
                        <div className='w-full lg:w-3/5 p-8 sm:p-10 lg:p-16 relative z-10'>
                            <div className='max-w-lg'>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className="inline-block mb-3 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full"
                                >
                                    <span className="text-white/90 text-sm font-medium">Premium Hair Styling Services</span>
                                </motion.div>
                                
                                <motion.h2 
                                    className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                >
                                    <span className="block">Your Style, Your Story, </span>
                                    
                                    <span className="relative inline-block">
                                        Our Expertise
                                        <svg className="absolute -bottom-2 left-0 w-full h-2 text-white/40" viewBox="0 0 100 15" preserveAspectRatio="none">
                                            <path d="M0,5 Q30,15 50,5 Q70,-5 100,5" fill="none" stroke="currentColor" strokeWidth="4" />
                                        </svg>
                                    </span>
                                </motion.h2>
                                
                                <motion.p 
                                    className='text-white/90 mb-6 text-sm sm:text-base leading-relaxed'
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                >
                                    Experience the artistry of our master stylists who blend cutting-edge trends with timeless techniques. From perfect cuts to stunning colors, we'll help you express your unique personality through your hair.
                                </motion.p>
                                
                                {/* Service tags */}
                                <motion.div 
                                    className="flex flex-wrap gap-2 mb-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                >
                                    {services.map((service, index) => (
                                        <span 
                                            key={index} 
                                            className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/20"
                                        >
                                            {service}
                                        </span>
                                    ))}
                                </motion.div>
                                
                                <motion.div 
                                    className='flex flex-col sm:flex-row gap-4 mb-8'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, duration: 0.5 }}
                                >
                                    <button 
                                        onClick={() => { 
                                            navigate('/stylists'); 
                                            scrollTo(0, 0); 
                                        }} 
                                        className='bg-white text-primary hover:text-white hover:bg-transparent hover:border-white border-2 border-white px-8 py-3 rounded-full font-medium shadow-xl shadow-primary/20 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2'
                                    >
                                        Book Now
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            navigate('/login');
                                            window.scrollTo(0, 0);
                                        }}
                                        className='border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-all duration-300'
                                    >
                                        Create Account
                                    </button>
                                </motion.div>
                                
                                <motion.div 
                                    className='flex items-center gap-4'
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                >
                                    <div className='flex -space-x-4'>
                                        {[1, 2, 3, 4].map(index => (
                                            <div 
                                                key={index} 
                                                className='w-10 h-10 rounded-full border-2 border-white overflow-hidden'
                                                style={{ zIndex: 5 - index }}
                                            >
                                                <img 
                                                    src={`/src/assets/doc${index}.png`} 
                                                    alt="Client" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className='text-white'>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className='font-medium text-sm'>Rated 5.0 by 500+ clients</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                        
                        {/* Right Side - Image */}
                        <motion.div 
                            className='w-full lg:w-2/5 relative'
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            <div className='h-80 sm:h-96 lg:h-full relative overflow-hidden'>
                                <img 
                                    className='w-full h-full object-cover object-center' 
                                    src={assets.hair_styling || assets.appointment_img}
                                    alt="Professional hair styling" 
                                />
                                
                                {/* Gradient overlay */}
                                <div className='absolute inset-0 bg-gradient-to-l from-transparent via-primary/20 to-primary/80 lg:from-transparent lg:via-transparent lg:to-transparent lg:bg-gradient-to-t lg:from-primary/40 lg:to-transparent'></div>
                            </div>
                            
                            {/* Floating elements */}
                            {/* <motion.div 
                                className='absolute top-6 right-6 lg:top-10 lg:right-10 bg-white rounded-xl p-4 shadow-xl max-w-[180px] hidden sm:block'
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9, duration: 0.6 }}
                            >
                                <div className='flex items-center gap-3 mb-1'>
                                    <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='font-semibold text-gray-800 text-sm'>New Clients</p>
                                        <p className='text-gray-500 text-xs'>20% off first visit</p>
                                    </div>
                                </div>
                            </motion.div> */}
                            
                            <motion.div 
                                className='absolute bottom-6 left-6 lg:bottom-10 lg:left-[-50px] bg-white rounded-xl p-4 shadow-xl max-w-[220px] hidden sm:block'
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1, duration: 0.6 }}
                            >
                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='font-semibold text-gray-800 text-sm'>Fast Booking</p>
                                        <p className='text-gray-500 text-xs'>In just 3 simple steps</p>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-1">
                                    {[1, 2, 3].map((step) => (
                                        <div key={step} className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${step === 3 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                {step}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {step === 1 ? 'Choose' : step === 2 ? 'Book' : 'Enjoy'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
                
                {/* Optional: Quick service highlights below the banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 px-2">
                    {[
                        {
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ),
                            title: "Express Styling",
                            description: "Quick professional styling for those on a tight schedule."
                        },
                        {
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            ),
                            title: "Premium Products",
                            description: "We use only salon-quality products for lasting results."
                        },
                        {
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            ),
                            title: "Expert Stylists",
                            description: "Our team stays current with the latest trends and techniques."
                        }
                    ].map((item, index) => (
                        <motion.div 
                            key={index}
                            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 + (index * 0.1), duration: 0.5 }}
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Banner
