import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
    return (
        <div className='w-full max-w-full bg-primary rounded-lg px-4 py-10 sm:px-6 md:px-8 lg:px-12 overflow-hidden'>
            <div className='container mx-auto flex flex-col md:flex-row items-center'>
                {/* --------- Header Left --------- */}
                <div className='w-full md:w-1/2 flex flex-col items-center md:items-start justify-center gap-5 md:gap-6 mb-10 md:mb-0'>
                    <h1 className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white font-bold leading-tight text-center md:text-left'>
                        Book Your Style <br className='hidden md:block' /> With Expert Stylists
                    </h1>
                    
                    <div className='flex flex-col sm:flex-row items-center gap-4 text-white'>
                        <img className='w-28 sm:w-32' src={assets.group_profiles} alt="Our stylists" />
                        <p className='text-sm md:text-base text-center md:text-left opacity-90'>
                            Discover our talented team of creative stylists and schedule your perfect hair transformation today.
                        </p>
                    </div>
                    
                    <a href='#services' className='mt-2 md:mt-4 flex items-center justify-center gap-3 bg-white text-primary font-medium px-8 py-3 rounded-full text-sm md:text-base hover:bg-opacity-90 hover:shadow-lg transition-all duration-300 transform hover:scale-105'>
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
                            src={assets.header_img} 
                            alt="Professional hair stylists at work" 
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-70'></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
