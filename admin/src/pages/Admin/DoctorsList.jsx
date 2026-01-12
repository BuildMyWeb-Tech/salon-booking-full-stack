import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { Scissors, Search, Filter, Plus, Phone, Mail, MapPin, Award, Star, ArrowUpDown } from 'lucide-react'
import { Link } from 'react-router-dom'

const StylistsList = () => {
  const { doctors: stylists, changeAvailability, aToken, getAllDoctors: getAllStylists } = useContext(AdminContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpeciality, setFilterSpeciality] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (aToken) {
      setLoading(true)
      getAllStylists().finally(() => {
        setLoading(false)
      })
    }
  }, [aToken])

  // Extract unique specialities for filter dropdown
  const specialities = ['all', ...new Set(stylists.map(stylist => stylist.speciality))]

  // Filter and sort stylists
  const filteredStylists = stylists
    .filter(stylist => {
      // Filter by search term
      const matchesSearch = stylist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stylist.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stylist.about && stylist.about.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filter by speciality
      const matchesSpeciality = filterSpeciality === 'all' || stylist.speciality === filterSpeciality

      return matchesSearch && matchesSpeciality
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'speciality') {
        comparison = a.speciality.localeCompare(b.speciality)
      } else if (sortBy === 'experience') {
        // Extract years from experience string or default to 0
        const aYears = parseInt(a.experience?.match(/\d+/)?.[0] || 0)
        const bYears = parseInt(b.experience?.match(/\d+/)?.[0] || 0)
        comparison = aYears - bYears
      }

      // Apply sort direction
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className='w-full max-w-7xl mx-auto px-4 py-6'>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
                <Scissors className="h-6 w-6 text-primary" />
                Stylists Directory
              </h1>
              <p className='text-gray-500'>Manage your salon's team of professional stylists</p>
            </div>
            
           <Link
            to="/add-doctor"
            className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Stylist
          </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search stylists by name, speciality..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={filterSpeciality}
                  onChange={e => setFilterSpeciality(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="all">All Specialities</option>
                  {specialities.filter(s => s !== 'all').map((speciality, idx) => (
                    <option key={idx} value={speciality}>{speciality}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="speciality">Sort by Speciality</option>
                  <option value="experience">Sort by Experience</option>
                </select>
                <button 
                  onClick={toggleSortOrder} 
                  className="absolute left-3 top-2.5"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <ArrowUpDown className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stylists Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredStylists.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStylists.map((stylist, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 hover:translate-y-[-5px]"
                >
                  <div className="relative">
                    {/* Stylist Image */}
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                        src={stylist.image} 
                        alt={stylist.name} 
                      />
                    </div>
                    
                    {/* Availability Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                      stylist.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {stylist.available ? 'Available' : 'Not Available'}
                    </div>
                    
                    {/* Experience Badge (if available) */}
                    {stylist.experience && (
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <Award size={12} />
                        {stylist.experience}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{stylist.name}</h3>
                        <p className="text-primary font-medium text-sm">{stylist.speciality}</p>
                      </div>
                      
                      {/* Rating (sample data) */}
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-gray-600 text-sm font-medium">
                          {(stylist.rating || (4 + Math.random()).toFixed(1)).slice(0, 3)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="mt-3 space-y-1.5">
                      {stylist.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          <span>{stylist.phone}</span>
                        </div>
                      )}
                      
                      {stylist.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                          <Mail size={14} />
                          <span className="truncate">{stylist.email}</span>
                        </div>
                      )}
                      
                      {stylist.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={14} />
                          <span>{stylist.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Availability Toggle */}
                    <div className="mt-4 pt-3 border-t">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={stylist.available} 
                            onChange={() => changeAvailability(stylist._id)} 
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {stylist.available ? 'Currently Available' : 'Mark as Available'}
                        </span>
                      </label>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                        View Profile
                      </button>
                      <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Scissors className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No stylists found</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              {searchTerm || filterSpeciality !== 'all' 
                ? 'Try changing your search criteria or filters' 
                : 'Add your first stylist to get started with your salon team'}
            </p>
            <Link
              to="/add-doctor"
              className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add New Stylist
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default StylistsList
