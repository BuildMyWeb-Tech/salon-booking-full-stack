import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
  return (
    <section
      id="speciality"
      className="w-full py-16 px-4 sm:px-6 md:px-8"
    >
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Find Your Perfect Style
          </h2>
          
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          
          <p className="text-gray-600">
            Browse our collection of specialized styling services and find the
            perfect stylist for your unique hair transformation.
          </p>
        </div>

        {/* Speciality Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {specialityData.map((item, index) => (
            <Link
              key={index}
              to={`/doctors`}
              onClick={() => scrollTo(0, 0)}
              className="group"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.speciality}
                    className="w-full h-56 sm:h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {item.speciality}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {item.description || 'Book an appointment with our expert stylists specializing in this service.'}
                  </p>
                  
                  
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SpecialityMenu
