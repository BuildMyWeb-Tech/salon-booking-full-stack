import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
  return (
    <section
      id="speciality"
      className="w-full py-14 px-4 sm:px-6 md:px-8"
    >
      <div className="container mx-auto">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Our Styling Services
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-5"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Explore professional hair services tailored to your look, lifestyle, and personality.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialityData.map((item, index) => (
            <Link
              key={index}
              to="/stylists"
              onClick={() => window.scrollTo(0, 0)}
              className="group"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full">

                {/* Image Wrapper */}
                <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.speciality}
                    className="w-full h-full object-contain"
                  />

                  {/* Hover overlay (optional) */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                    {item.speciality}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {item.description ||
                      'Book an appointment with our expert stylists specializing in this service.'}
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
