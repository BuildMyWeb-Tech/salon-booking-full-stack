// In SpecialityMenu.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { specialityData } from '../assets/assets'; // Keep as fallback

const SpecialityMenu = () => {
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { backendUrl } = useContext(AppContext);

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  const fetchServiceCategories = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/services`);
      if (data.success && data.services.length > 0) {
        setServiceCategories(data.services);
      }
    } catch (error) {
      console.error('Error fetching service categories:', error);
      // Use fallback data if API fails
    } finally {
      setLoading(false);
    }
  };

  // Use real data if available, otherwise use fallback data
  const displayData = serviceCategories.length > 0 ? serviceCategories : specialityData;

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

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayData.map((item, index) => (
              <Link
                key={item._id || index}
                to="/stylists"
                onClick={() => window.scrollTo(0, 0)}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  {/* Image Wrapper */}
                  <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
                    <img
                      src={item.imageUrl || item.image}
                      alt={item.name || item.speciality}
                      className="w-full h-full object-cover"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                      {item.name || item.speciality}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      {item.description || 
                        'Book an appointment with our expert stylists specializing in this service.'}
                    </p>
                    {item.basePrice && (
                      <p className="text-sm font-semibold text-primary mt-2">
                        Starting from ₹{item.basePrice}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SpecialityMenu;
