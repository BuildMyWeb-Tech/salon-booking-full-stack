import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';

const Stylists = () => {
  const { speciality } = useParams();
  const [filteredStylists, setFilteredStylists] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  // Rename context variable from doctors to stylists
  const { doctors: stylists } = useContext(AppContext);

  const applyFilter = () => {
    if (speciality) {
      setFilteredStylists(stylists.filter(stylist => stylist.speciality === speciality));
    } else {
      setFilteredStylists(stylists);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [stylists, speciality]);

  // Hair speciality categories
  const specialities = [
    'Hair Styling Specialist',
    'Beard & Grooming Specialist',
    'Hair Coloring Specialist', 
    'Hair Treatment Specialist',
    'Bridal Hairstylist',
    'Unisex Hairstylist'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">
          Professional Hair Stylists
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find and book appointments with our expert stylists specializing in cuts, colors, treatments, and more.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-6 mt-5">
        {/* Filter section */}
        <div className="w-full sm:w-64 mb-6 sm:mb-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Filter by Specialty</h3>
            <button 
              onClick={() => setShowFilter(!showFilter)} 
              className="sm:hidden flex items-center gap-1 text-primary"
            >
              {showFilter ? 'Hide' : 'Show'} 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className={`flex flex-col gap-3 text-sm ${showFilter ? 'block' : 'hidden sm:block'}`}>
            <div 
              onClick={() => navigate('/stylists')}
              className={`px-4 py-3 my-3 rounded-lg cursor-pointer transition-all border ${!speciality ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              All Stylists
            </div>
            
            {specialities.map((spec, index) => (
              <div 
                key={index}
                onClick={() => speciality === spec ? navigate('/stylists') : navigate(`/stylists/${spec}`)}
                className={`px-4 py-3 my-3 rounded-lg cursor-pointer transition-all border ${speciality === spec ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                {spec}
              </div>
            ))}
          </div>
        </div>

        {/* Stylists grid */}
        <div className="w-full">
          {filteredStylists.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No stylists found for this specialty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStylists.map((stylist) => (
                <div 
                  key={stylist._id}
                  onClick={() => { 
                    navigate(`/appointment/${stylist._id}`); 
                    scrollTo(0, 0); 
                  }} 
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-56 overflow-hidden">
                    <img 
                      className="w-full h-full object-cover" 
                      src={stylist.image} 
                      alt={stylist.name} 
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-primary">
                        {stylist.speciality}
                      </span>
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${stylist.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${stylist.available ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        <span>{stylist.available ? 'Available' : 'Unavailable'}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{stylist.name}</h3>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${star <= (stylist.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-500">({stylist.reviewCount || '24'} reviews)</span>
                    </div>

                    <button className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stylists;
