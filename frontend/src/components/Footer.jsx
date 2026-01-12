import React from 'react'
import { assets } from '../assets/assets'
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Linkedin, Scissors } from 'lucide-react'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 my-10 mt-40 text-sm'>
        {/* About Us */}
        <div className="lg:col-span-1">
          <img className='mb-5 w-40' src={assets.logo} alt="StyleStudio Logo" />
          <p className='w-full text-gray-600 leading-6 mb-6'>
            StyleStudio brings expert hair styling and cutting services to help you look your absolute best. Our team of professional stylists are dedicated to creating the perfect look that matches your personality and lifestyle.
          </p>
          <div className='flex space-x-4 mt-4'>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className='w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition duration-300'>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className='w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition duration-300'>
              <Instagram size={20} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className='w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition duration-300'>
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className='w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition duration-300'>
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className='text-xl font-medium mb-5'>QUICK LINKS</p>
          <ul className='flex flex-col gap-3 text-gray-600'>
            <li><a href="/" className='hover:text-primary transition-colors flex items-center'><span className='mr-2'>›</span>Home</a></li>
            <li><a href="/about" className='hover:text-primary transition-colors flex items-center'><span className='mr-2'>›</span>About us</a></li>
            <li><a href="/stylists" className='hover:text-primary transition-colors flex items-center'><span className='mr-2'>›</span>Our Stylists</a></li>
            <li><a href="/contact" className='hover:text-primary transition-colors flex items-center'><span className='mr-2'>›</span>Contact us</a></li>
            <li><a href="/services" className='hover:text-primary transition-colors flex items-center'><span className='mr-2'>›</span>Services</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p className='text-xl font-medium mb-5'>LEGAL</p>
          <ul className='flex flex-col gap-3 text-gray-600'>
            <li><a href="/privacy-policy" className='hover:text-primary transition-colors flex items-center'><span className='mr-2'>›</span>Privacy Policy</a></li>
            <li><a href="/booking-policy" className='hover:text-primary transition-colors flex items-center'><span className='mr-2'>›</span>Booking Policy</a></li>
            <li><a href="/terms-and-conditions" className='hover:text-primary transition-colors flex items-center'><span className='mr-2'>›</span>Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <p className='text-xl font-medium mb-5'>OUR SERVICES</p>
          <ul className='flex flex-col gap-3 text-gray-600'>
            <li className='flex items-center'>
              <Scissors size={16} className='mr-2' />
              <span>Haircut & Styling</span>
            </li>
            <li className='flex items-center'>
              <Scissors size={16} className='mr-2' />
              <span>Color Services</span>
            </li>
            <li className='flex items-center'>
              <Scissors size={16} className='mr-2' />
              <span>Hair Treatments</span>
            </li>
            <li className='flex items-center'>
              <Scissors size={16} className='mr-2' />
              <span>Men's Grooming</span>
            </li>
            <li className='flex items-center'>
              <Scissors size={16} className='mr-2' />
              <span>Bridal Services</span>
            </li>
          </ul>
        </div>

        {/* Get In Touch */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-4 text-gray-600'>
            <li>
              <a href="tel:+919344095727" className='flex items-start hover:text-primary transition-colors'>
                <Phone className='mr-3 mt-1 flex-shrink-0' size={18} />
                <span>+91 9344095727</span>
              </a>
            </li>
            <li>
              <a href="tel:+918610961158" className='flex items-start hover:text-primary transition-colors'>
                <Phone className='mr-3 mt-1 flex-shrink-0' size={18} />
                <span>+91 8610961158</span>
              </a>
            </li>
            <li>
              <a href="mailto:info@stylestudio.com" className='flex items-start hover:text-primary transition-colors'>
                <Mail className='mr-3 mt-1 flex-shrink-0' size={18} />
                <span>info@stylestudio.com</span>
              </a>
            </li>
            <li className='flex items-start'>
              <MapPin className='mr-3 mt-1 flex-shrink-0' size={18} />
              <span>69, Mettu Street, Srirangam, Pincode-620006, Trichy</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="py-5 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">Copyright 2024 @ StyleStudio.com - All Rights Reserved.</p>
          <p className="text-sm text-gray-600 mt-2 sm:mt-0">
            Designed and Developed by <a href="https://buildmyweb.info/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">BuildMyWeb</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Footer
