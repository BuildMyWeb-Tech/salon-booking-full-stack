import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion' // Add framer-motion for animations


const Header = () => {
    return (
        <div className='w-full max-w-full bg-primary rounded-lg px-4 py-10 sm:px-6 md:px-8 lg:px-12 overflow-hidden'>
            <div className='container mx-auto flex flex-col md:flex-row items-center'>
                {/* --------- Header Left --------- */}
                <div className='w-full md:w-1/2 flex flex-col items-center md:items-start justify-center gap-5 md:gap-6 mb-10 md:mb-0'>
                    <h1 className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white font-bold leading-tight text-center md:text-left'>
                         Your Style, Your Story,<br className='hidden md:block' /> Our Expertise
                    </h1>
                    
                    <div className='flex flex-col sm:flex-row items-center gap-4 text-white'>
                        <img className='w-28 sm:w-32' src={assets.group_profiles} alt="Our stylists" />
                        <p className='text-sm md:text-base text-center md:text-left opacity-90'>
                            Discover our talented team of creative stylists and schedule your perfect hair transformation today.
                        </p>
                    </div>
                    
                    <a href='/stylists' className='mt-2 md:mt-4 flex items-center justify-center gap-3 bg-white text-primary font-medium px-8 py-3 rounded-full text-sm md:text-base hover:bg-opacity-90 hover:shadow-lg transition-all duration-300 transform hover:scale-105'>
                        Book Now 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>

                {/* --------- Header Right --------- */}
                <div className='w-full md:w-1/2 relative'>
                    <div className='relative h-64 sm:h-80 md:h-96 lg:h-[450px] overflow-hidden rounded-lg'>
                        <img 
                            className='w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-all duration-700' 
                            src={assets.banner_img} 
                            alt="Professional hair stylists at work" 
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-70'></div>
                    </div>
                </div>
            </div>

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
    )
}

export default Header
