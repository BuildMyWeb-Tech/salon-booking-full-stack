import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Star,
  ChevronDown,
  Filter,
  Clock,
  Calendar,
  Award,
  Search,
  Sparkles,
  Scissors
} from 'lucide-react';

const Stylists = () => {
  const { speciality } = useParams();
  const [filteredStylists, setFilteredStylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { doctors: stylists } = useContext(AppContext);

  const applyFilter = () => {
    let filtered = [...stylists];

    if (speciality) {
      filtered = filtered.filter(s => s.speciality === speciality);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.speciality?.toLowerCase().includes(q)
      );
    }

    setFilteredStylists(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [stylists, speciality, searchQuery]);

  const specialities = [
    'Hair Styling Specialist',
    'Beard & Grooming Specialist',
    'Hair Coloring Specialist',
    'Hair Treatment Specialist',
    'Bridal Hairstylist',
    'Unisex Hairstylist'
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">

      {/* HERO */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm mb-4">
            <Sparkles size={16} className="text-yellow-300" />
            Find Your Perfect Look
          </span>

          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Professional Salon Stylists
          </h1>

          <p className="text-white/90 max-w-2xl mx-auto text-base md:text-lg">
            Choose from expert hair stylists, grooming professionals, and bridal specialists
            to transform your style with confidence.
          </p>
        </div>
      </div>

      {/* FILTER BAR – ALWAYS VISIBLE */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* SEARCH + SORT */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 py-4">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stylist or service..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* SORT */}
            <select className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700">
              <option>Most Popular</option>
              <option>Experience</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 pt-8">

        {filteredStylists.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border">
            <Scissors size={36} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Stylists Found</h3>
            <p className="text-gray-600 mb-6">
              Try changing filters or searching another service.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                navigate('/stylists');
              }}
              className="px-6 py-3 bg-primary text-white rounded-lg"
            >
              View All Stylists
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {filteredStylists.map(stylist => (
              <div
                key={stylist._id}
                onClick={() => {
                  navigate(`/appointment/${stylist._id}`);
                  scrollTo(0, 0);
                }}
                className="bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition cursor-pointer"
              >

                {/* IMAGE */}
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={stylist.image}
                    alt={stylist.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black p-4">
                    <h3 className="text-white font-bold text-lg">
                      {stylist.name}
                    </h3>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <Scissors size={14} />
                      {stylist.speciality}
                    </p>
                  </div>
                </div>

                {/* INFO */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Award size={14} className="text-primary" />
                      {stylist.experience || '5 Years'}
                    </span>
                    <span className="font-semibold">
                      ₹{stylist.price || stylist.fees || 500}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                    <Clock size={14} className="text-primary" />
                    Next Slot: Today 2:00 PM
                  </div>

                  <button className="w-full py-2.5 bg-primary text-white rounded-lg flex items-center justify-center gap-2">
                    <Calendar size={16} />
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SCROLLBAR HIDE */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Stylists;
