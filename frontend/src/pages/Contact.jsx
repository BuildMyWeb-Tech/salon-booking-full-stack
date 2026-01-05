import React from 'react'
import { assets } from '../assets/assets'
import { Phone, Mail, MapPin, Clock, Scissors, CalendarRange } from 'lucide-react'

const Contact = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className='text-center mb-12'>
          <h6 className="text-primary font-medium tracking-wide">GET IN TOUCH</h6>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mt-2'>
            CONTACT <span className='text-primary'>US</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-4"></div>
          <p className="max-w-2xl mx-auto text-gray-600 mt-4">
            We'd love to hear from you! Reach out for appointments, questions, or just to say hello.
          </p>
        </div>

        {/* Main Content */}
        <div className='flex flex-col lg:flex-row gap-12 mb-16'>
          {/* Contact Information */}
          <div className='lg:w-1/2'>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Style Studio</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="text-primary w-5 h-5 mr-4 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Our Location</h4>
                      <p className="text-gray-600">69, Mettu Street, Srirangam, <br />Pincode-620006, Trichy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="text-primary w-5 h-5 mr-4 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Phone Number</h4>
                      <p className="text-gray-600">
                        <a href="tel:+919344095727" className="hover:text-primary transition-colors">+91 9344095727</a>
                        <br />
                        <a href="tel:+918610961158" className="hover:text-primary transition-colors">+91 8610961158</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="text-primary w-5 h-5 mr-4 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Email Address</h4>
                      <p className="text-gray-600">
                        <a href="mailto:info@stylestudio.com" className="hover:text-primary transition-colors">info@stylestudio.com</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="text-primary w-5 h-5 mr-4 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Working Hours</h4>
                      <p className="text-gray-600">
                        Monday - Saturday: 9:00 AM - 8:00 PM <br />
                        Sunday: 10:00 AM - 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">BOOK AN APPOINTMENT</h4>
                  <p className="text-gray-600 mb-4">Schedule your styling session with our expert team.</p>
                  <a href="/appointment" className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition duration-300">
                    <CalendarRange className="w-5 h-5 mr-2" />
                    Book Now
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map and Image Section */}
          <div className='lg:w-1/2'>
            <div className="rounded-lg overflow-hidden shadow-lg h-full flex flex-col">
              {/* Google Map */}
              <div className="h-96 w-full bg-gray-200 relative">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5511202655507!2d78.68402671100183!3d10.851786457720954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baaf5d6fa43d9f7%3A0x278a8e4b2467aa36!2sSrirangam%2C%20Tiruchirappalli%2C%20Tamil%20Nadu%20620006!5e0!3m2!1sen!2sin!4v1661326021342!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Style Studio Location"
                ></iframe>
              </div>
              
              {/* Styling Services */}
              <div className="bg-white p-8 flex-grow">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Styling Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Haircut & Styling",
                    "Color Services",
                    "Hair Extensions",
                    "Bridal Styling",
                    "Hair Treatments",
                    "Men's Grooming"
                  ].map((service, index) => (
                    <div key={index} className="flex items-center">
                      <Scissors className="text-primary w-4 h-4 mr-3" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Send Us a Message</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Your Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="John Doe" 
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="john@example.com" 
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+91 98765 43210" 
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="service">Service Interest</label>
              <select 
                id="service" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a service</option>
                <option value="haircut">Haircut & Styling</option>
                <option value="coloring">Hair Coloring</option>
                <option value="extensions">Hair Extensions</option>
                <option value="bridal">Bridal Styling</option>
                <option value="treatments">Hair Treatments</option>
                <option value="mens">Men's Grooming</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">Your Message</label>
              <textarea 
                id="message" 
                rows="4" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            
            <div className="md:col-span-2 text-center">
              <button type="submit" className="bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-dark transition duration-300">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact
