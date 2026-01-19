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
  Scissors,
  Users,
  Sliders,
  Wallet,
  PanelRight,
  Instagram,
  CircleCheck,
  MapPin,
  ShieldCheck
} from 'lucide-react';

const Stylists = () => {
  const { speciality } = useParams();
  const [filteredStylists, setFilteredStylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
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
    
    // Sort stylists based on selection
    switch (selectedSort) {
      case 'popularity':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'experience':
        filtered.sort((a, b) => {
          const aYears = parseInt(a.experience?.match(/\d+/)?.[0] || 0);
          const bYears = parseInt(b.experience?.match(/\d+/)?.[0] || 0);
          return bYears - aYears;
        });
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.price || a.fees || 500) - (b.price || b.fees || 500));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || b.fees || 500) - (a.price || a.fees || 500));
        break;
    }

    setFilteredStylists(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [stylists, speciality, searchQuery, selectedSort]);

  const specialities = [
    'Hair Styling Specialist',
    'Beard & Grooming Specialist',
    'Hair Coloring Specialist',
    'Hair Treatment Specialist',
    'Bridal Hairstylist',
    'Unisex Hairstylist'
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12 pt-0 md:pt-4">
      {/* HERO */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white pt-12 pb-16 md:pt-16 md:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.png')] opacity-10 bg-repeat"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-4">
            <Sparkles size={16} className="text-yellow-300" />
            <span className="font-medium">Expert Hair Professionals</span>
          </span>

          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            Find Your Perfect Look
          </h1>

          <p className="text-white/90 max-w-2xl mx-auto text-base md:text-lg">
            Choose from our curated team of experienced stylists specializing in cuts, colors, 
            treatments and bridal styling.
          </p>
          
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-3xl">
            <div className="relative mx-4">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by stylist name, specialty, or service..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-4 rounded-full border-0 shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR – ALWAYS VISIBLE */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm mt-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* SORT + FILTER CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            {/* Results counter */}
            <div className="text-gray-500 text-sm">
              Found <span className="font-medium text-gray-800">{filteredStylists.length}</span> stylists
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* View toggle */}
              <div className="hidden sm:flex border rounded-md overflow-hidden">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <PanelRight size={18} className="text-gray-600" />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <Users size={18} className="text-gray-600" />
                </button>
              </div>
              
              {/* Sort dropdown */}
              <div className="relative">
                <select 
                  className="appearance-none border rounded-md pl-4 pr-8 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                  value={selectedSort}
                  onChange={e => setSelectedSort(e.target.value)}
                >
                  <option value="popularity">Most Popular</option>
                  <option value="experience">Experience</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              {/* Filter button */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Sliders size={16} className={showFilters ? 'text-white' : 'text-gray-600'} />
                <span>Filter</span>
              </button>
            </div>
          </div>
          
          {/* Filter panel - toggleable */}
          {showFilters && (
            <div className="py-4 border-t animate-fadeDown">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                  <select className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700">
                    <option value="">All Specialties</option>
                    {specialities.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700"
                    />
                    <span className="text-gray-500">to</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700">
                    <option value="">Any Time</option>
                    <option value="today">Available Today</option>
                    <option value="week">Available This Week</option>
                    <option value="weekend">Weekend Availability</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {filteredStylists.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border shadow-sm">
            <div className="bg-red-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4">
              <Scissors size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Stylists Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your filters or search for different services.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                navigate('/stylists');
              }}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              View All Stylists
            </button>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStylists.map(stylist => (
                <div
                  key={stylist._id}
                  onClick={() => {
                    navigate(`/appointment/${stylist._id}`);
                    scrollTo(0, 0);
                  }}
                  className="bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all cursor-pointer group"
                >
                  {/* IMAGE */}
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img
                      src={stylist.image}
                      alt={stylist.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80"></div>

                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {stylist.available && (
                        <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm flex items-center gap-1">
                          <CircleCheck size={12} />
                          Available
                        </span>
                      )}
                      
                      {stylist.verified && (
                        <span className="bg-blue-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm flex items-center gap-1">
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <h3 className="text-white font-bold text-xl mb-1 group-hover:text-primary/90">
                        {stylist.name}
                      </h3>
                      <p className="text-white/90 text-sm flex items-center gap-1.5 mb-2">
                        <Scissors size={14} />
                        {stylist.speciality}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 text-sm mb-2">
                        <div className="bg-yellow-400 text-white p-1 rounded flex items-center">
                          <Star size={12} fill="white" />
                        </div>
                        <span className="text-white font-medium">{stylist.rating || "4.8"}</span>
                        <span className="text-white/70">({stylist.reviewCount || "124"} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Award size={14} className="text-primary" />
                        <span className="font-medium">{stylist.experience || '5 Years'}</span>
                      </span>
                      <span className="font-bold text-primary text-base">
                        ₹{stylist.price || stylist.fees || 500}+
                      </span>
                    </div>

                    {stylist.instagram && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Instagram size={14} className="text-pink-500" />
                        @{stylist.instagram}
                      </div>
                    )}
                    
                    {stylist.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} className="text-gray-400" />
                        {stylist.location}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm bg-gray-50 p-2.5 rounded-lg">
                      <Clock size={14} className="text-primary" />
                      <span className="text-gray-700">Next Available: Today 2:00 PM</span>
                    </div>

                    <button className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow">
                      <Calendar size={16} />
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStylists.map(stylist => (
                <div
                  key={stylist._id}
                  onClick={() => {
                    navigate(`/appointment/${stylist._id}`);
                    scrollTo(0, 0);
                  }}
                  className="bg-white rounded-xl overflow-hidden border hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row"
                >
                  <div className="md:w-1/4 relative">
                    <img
                      src={stylist.image}
                      alt={stylist.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                    
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                      {stylist.available && (
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm flex items-center gap-1">
                          <CircleCheck size={10} />
                          Available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{stylist.name}</h3>
                      <span className="font-bold text-primary">₹{stylist.price || stylist.fees || 500}+</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-sm">
                      <span className="font-medium text-primary">{stylist.speciality}</span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Award size={14} className="text-gray-400" />
                        {stylist.experience}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={14} fill="#FACC15" className="text-yellow-400" />
                        <span className="font-medium">{stylist.rating || "4.8"}</span>
                        <span className="text-gray-500">({stylist.reviewCount || "124"})</span>
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-2 text-sm mb-3">
                      {stylist.about || "Professional stylist specializing in modern techniques and personalized service to create the perfect look for every client."}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-3 justify-between items-end">
                      <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Clock size={14} className="text-primary" />
                        <span className="text-gray-700">Next Available: Today 2:00 PM</span>
                      </div>
                      
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
                        <Calendar size={15} />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* CSS animation */}
      <style jsx>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeDown {
          animation: fadeDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Stylists;
