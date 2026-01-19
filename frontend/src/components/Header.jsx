import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Scissors,
  Palette,
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react'

const Banner = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(1)

  const services = [
    { name: 'Haircuts', icon: <Scissors size={16} /> },
    { name: 'Styling', icon: <Sparkles size={16} /> },
    { name: 'Coloring', icon: <Palette size={16} /> },
    { name: 'Treatments', icon: <Sparkles size={16} /> },
    { name: 'Extensions', icon: <Scissors size={16} /> }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev === 3 ? 1 : prev + 1))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const FastBookingCard = ({ className = '' }) => (
    <motion.div
      className={`bg-white rounded-2xl p-6 shadow-2xl w-[280px] ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary'>
          <Clock size={22} />
        </div>
        <div>
          <p className='font-semibold text-gray-800'>Fast Booking</p>
          <p className='text-gray-500 text-sm'>Book in seconds</p>
        </div>
      </div>

      <div className='flex justify-between items-center gap-3 text-center'>
        {[1, 2, 3].map(step => (
          <div key={step} className='flex flex-col items-center'>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                activeStep === step
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step}
            </div>
            <span className='text-xs text-gray-500 mt-1 whitespace-nowrap'>
              {step === 1 && 'Choose Stylist'}
              {step === 2 && 'Pick Time'}
              {step === 3 && 'Confirm'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )

  return (
    <section className='w-full bg-gray-50'>
      <div className='container mx-auto px-4'>
        <motion.div
          className='bg-gradient-to-r from-primary via-purple-600 to-indigo-600 rounded-2xl overflow-hidden shadow-2xl'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='flex flex-col md:flex-row'>

            {/* LEFT CONTENT */}
            <div className='w-full md:w-3/5 p-8 sm:p-10 lg:p-16'>
              <div className='max-w-xl'>

                <div className='inline-block mb-4 bg-white/20 backdrop-blur px-4 py-1 rounded-full'>
                  <span className='text-white text-sm font-medium'>
                    Premium Salon Experience
                  </span>
                </div>

                <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                  Elevate Your Look <br />
                  With Expert Salon Care
                </h2>

                <p className='text-white/90 text-sm sm:text-base mb-6'>
                  From precision cuts to complete makeovers, our professional stylists
                  deliver personalized services designed for you.
                </p>

                <div className='flex flex-wrap gap-2 mb-8'>
                  {services.map((service, index) => (
                    <span
                      key={index}
                      className='flex items-center gap-2 px-3 py-1 bg-white/10 text-white text-sm rounded-full'
                    >
                      {service.icon}
                      {service.name}
                    </span>
                  ))}
                </div>

                <div className='flex flex-col sm:flex-row gap-4'>
                  <button
                    onClick={() => navigate('/stylists')}
                    className='bg-white text-primary px-8 py-3 rounded-full font-medium flex items-center justify-center gap-2'
                  >
                    Book Appointment
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => navigate('/login')}
                    className='border-2 border-white text-white px-8 py-3 rounded-full font-medium'
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE — ONLY TAB & LAP */}
            <div className='hidden md:block md:w-2/5 relative'>
              <img
                src={assets.hair_styling || assets.hero_img}
                alt='Salon'
                className='w-full h-full object-contain'
              />

              {/* FAST BOOKING — DESKTOP */}
              <div className='absolute bottom-8 left-[-60px]'>
                <FastBookingCard />
              </div>
            </div>
          </div>

          {/* FAST BOOKING — MOBILE ONLY */}
          <div className='md:hidden py-8 flex justify-center'>
            <FastBookingCard />
          </div>

        </motion.div>
      </div>
    </section>
  )
}

export default Banner
