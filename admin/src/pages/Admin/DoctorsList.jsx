import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios';
import {
  Scissors,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Award,
  ArrowUpDown,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Check,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

const StylistsList = () => {
  const {
    doctors: stylists,
    changeAvailability,
    aToken,
    getAllDoctors: getAllStylists,
    deleteDoctor: deleteStylist
  } = useContext(AdminContext)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [stylistToDelete, setStylistToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [serviceCategories, setServiceCategories] = useState([])
  const itemsPerPage = 9

  // Load both stylists and service categories
  useEffect(() => {
    if (aToken) {
      setLoading(true)
      
      Promise.all([
        getAllStylists(),
        fetchServiceCategories()
      ])
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
    }
  }, [aToken])

  // Function to fetch service categories
  const fetchServiceCategories = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      const { data } = await axios.get(
        `${backendUrl}/api/admin/services`,
        { headers: { aToken } }
      )
      
      if (data.success) {
        setServiceCategories(data.services)
      }
    } catch (error) {
      console.error("Error fetching service categories:", error)
    }
  }

  // Extract all unique specialties from stylists for fallback
  const extractUniqueSpecialties = () => {
    const specialtySets = new Set()
    
    stylists.forEach(stylist => {
      const specialtyArray = stylist.specialty || stylist.speciality || []
      
      // Handle both string and array formats
      if (Array.isArray(specialtyArray)) {
        specialtyArray.forEach(s => specialtySets.add(s))
      } else if (typeof specialtyArray === 'string') {
        specialtySets.add(specialtyArray)
      }
    })
    
    return ['all', ...Array.from(specialtySets)]
  }

  /* ===== GET SPECIALTIES FROM SERVICE CATEGORIES OR FALLBACK TO STYLIST DATA ===== */
  const specialties = serviceCategories.length > 0 
    ? ['all', ...serviceCategories.map(category => category.name)] 
    : extractUniqueSpecialties()

  /* ===== FILTER + SORT LOGIC ===== */
  const filteredStylists = stylists
    .filter(stylist => {
      const matchesSearch =
        stylist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(stylist.specialty) && stylist.specialty.some(s => 
          s.toLowerCase().includes(searchTerm.toLowerCase())
        )) || 
        (Array.isArray(stylist.speciality) && stylist.speciality.some(s => 
          s.toLowerCase().includes(searchTerm.toLowerCase())
        ))

      // Check if stylist has the selected specialty
      const stylistSpecialties = Array.isArray(stylist.specialty) 
        ? stylist.specialty 
        : Array.isArray(stylist.speciality)
          ? stylist.speciality
          : []

      const matchesSpecialty =
        filterSpecialty === 'all' || 
        stylistSpecialties.includes(filterSpecialty)

      return matchesSearch && matchesSpecialty
    })
    .sort((a, b) => {
      let result = 0

      if (sortBy === 'name') {
        result = a.name.localeCompare(b.name)
      }

      if (sortBy === 'specialty') {
        const aSpecialty = Array.isArray(a.specialty) 
          ? a.specialty.join(', ') 
          : Array.isArray(a.speciality) 
            ? a.speciality.join(', ')
            : ''
            
        const bSpecialty = Array.isArray(b.specialty) 
          ? b.specialty.join(', ') 
          : Array.isArray(b.speciality)
            ? b.speciality.join(', ')
            : ''
            
        result = aSpecialty.localeCompare(bSpecialty)
      }

      if (sortBy === 'experience') {
        const aExp = parseInt(a.experience?.match(/\d+/)?.[0] || 0)
        const bExp = parseInt(b.experience?.match(/\d+/)?.[0] || 0)
        result = aExp - bExp
      }

      return sortOrder === 'asc' ? result : -result
    })

  // Pagination
  const totalPages = Math.ceil(filteredStylists.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStylists = filteredStylists.slice(startIndex, startIndex + itemsPerPage)

  // Handle delete button click
  const handleDeleteClick = (stylist) => {
    setStylistToDelete(stylist)
    setShowDeleteModal(true)
  }

  // Confirm delete action
  const confirmDelete = async () => {
    if (!stylistToDelete) return

    try {
      setIsDeleting(true)
      await deleteStylist(stylistToDelete._id)
      setShowDeleteModal(false)
      setStylistToDelete(null)
    } catch (error) {
      console.error("Error deleting stylist:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='w-full max-w-7xl mx-auto px-4 py-6'>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        {/* HEADER */}
        <div className="p-6 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
                <Scissors className="text-primary h-6 w-6" strokeWidth={2} />
                Salon Stylists
              </h1>
              <p className='text-gray-500 mt-1'>
                Manage professional hairstylists and availability
              </p>
            </div>

            <Link
              to="/add-stylist"
              className="bg-primary text-white py-2.5 px-5 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm hover:shadow transform hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Add Stylist
            </Link>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:outline-none shadow-sm"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            {/* Service Category Filter */}
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={filterSpecialty}
                onChange={e => {
                  setFilterSpecialty(e.target.value)
                  setCurrentPage(1) // Reset to first page when filter changes
                }}
                className="appearance-none pl-9 pr-8 py-2.5 w-full border rounded-lg focus:ring-2 focus:ring-primary/30 focus:outline-none shadow-sm"
              >
                {specialties.map((specialty, i) => (
                  <option key={i} value={specialty}>
                    {specialty === 'all' ? 'All Specialties' : specialty}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>

            <div className="relative min-w-[140px]">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 w-full border rounded-lg focus:ring-2 focus:ring-primary/30 focus:outline-none shadow-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="specialty">Sort by Specialty</option>
                <option value="experience">Sort by Experience</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-3 py-2 border rounded-lg shadow-sm hover:bg-gray-100 transition-colors flex items-center justify-center ${sortOrder === 'desc' ? 'bg-gray-100' : 'bg-white'}`}
              title={`Currently: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'asc' ? 
                <ChevronUp size={18} className="text-gray-600" /> : 
                <ChevronDown size={18} className="text-gray-600" />
              }
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="px-6 py-3 border-b text-sm text-gray-500 flex flex-wrap justify-between items-center">
          <div>
            Showing {filteredStylists.length > 0 ? startIndex + 1 : 0}-
            {Math.min(startIndex + itemsPerPage, filteredStylists.length)} of {filteredStylists.length} results
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${sortOrder === 'asc' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span>{sortOrder === 'asc' ? 'A to Z' : 'Z to A'} by {sortBy === 'name' ? 'name' : sortBy === 'specialty' ? 'specialty' : 'experience'}</span>
            {filterSpecialty !== 'all' && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                Filtered: {filterSpecialty}
              </span>
            )}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-4 border-t-primary border-gray-200 rounded-full mb-4"></div>
            <p className="text-gray-500">Loading stylists...</p>
          </div>
        ) : filteredStylists.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <Scissors size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No stylists found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchTerm || filterSpecialty !== 'all' ? 
                'Try adjusting your search or filters to find what you\'re looking for.' : 
                'Get started by adding your first stylist to the team.'}
            </p>
            <Link
              to="/add-stylist"
              className="inline-flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition"
            >
              <Plus size={16} />
              Add Your First Stylist
            </Link>
          </div>
        ) : (
          <>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedStylists.map(stylist => (
                <div
                  key={stylist._id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-gray-300 hover:translate-y-[-2px]"
                >
                  {/* IMAGE WITH STATUS OVERLAY */}
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    <img
                      src={stylist.image}
                      alt={stylist.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                      stylist.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    } shadow-sm flex items-center gap-1`}>
                      {stylist.available ? 
                        <><UserCheck size={12} /> Available</> : 
                        <><Clock size={12} /> Not Available</>
                      }
                    </div>
                    {/* Experience Badge */}
                    {stylist.experience && (
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5">
                        <Award size={12} />
                        {stylist.experience}
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {stylist.name}
                      </h3>

                      <p className="text-primary text-sm font-medium">
                        {Array.isArray(stylist.specialty) 
                          ? stylist.specialty.join(', ') 
                          : Array.isArray(stylist.speciality)
                            ? stylist.speciality.join(', ')
                            : 'General Stylist'}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      {stylist.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          {stylist.phone}
                        </div>
                      )}

                      {stylist.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                          <Mail size={14} className="text-gray-400" />
                          <span className="truncate">{stylist.email}</span>
                        </div>
                      )}
                    </div>

                    {/* AVAILABILITY TOGGLE */}
                    <div className="pt-3 border-t">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={stylist.available}
                            onChange={() => changeAvailability(stylist._id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-checked:bg-primary rounded-full relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {stylist.available ? 'Currently Available' : 'Mark as Available'}
                        </span>
                      </label>
                    </div>
                    
                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 mt-4">
                      <Link 
                        to={`/edit-stylist/${stylist._id}`}
                        className="flex-1 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(stylist)}
                        className="flex-1 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="p-5 border-t flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-md flex items-center justify-center text-sm transition-colors ${
                        currentPage === i + 1
                          ? 'bg-primary text-white font-medium'
                          : 'border bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Confirm Deletion</h3>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete the stylist <span className="font-medium text-gray-800">{stylistToDelete?.name}</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone and will remove all associated data.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Stylist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Adding missing ChevronDown and ChevronUp components
const ChevronDown = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
)

const ChevronUp = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m18 15-6-6-6 6"/>
  </svg>
)

export default StylistsList
