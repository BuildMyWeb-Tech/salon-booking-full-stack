import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import {
  Scissors,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Award,
  ArrowUpDown
} from 'lucide-react'
import { Link } from 'react-router-dom'

const StylistsList = () => {
  const {
    doctors: stylists,
    changeAvailability,
    aToken,
    getAllDoctors: getAllStylists
  } = useContext(AdminContext)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (aToken) {
      setLoading(true)
      getAllStylists().finally(() => setLoading(false))
    }
  }, [aToken])

  /* ===== UNIQUE SPECIALTIES FROM ADD STYLIST DATA ===== */
  const specialties = ['all', ...new Set(stylists.map(s => s.specialty))]

  /* ===== FILTER + SORT LOGIC ===== */
  const filteredStylists = stylists
    .filter(stylist => {
      const matchesSearch =
        stylist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stylist.specialty.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSpecialty =
        filterSpecialty === 'all' || stylist.specialty === filterSpecialty

      return matchesSearch && matchesSpecialty
    })
    .sort((a, b) => {
      let result = 0

      if (sortBy === 'name') {
        result = a.name.localeCompare(b.name)
      }

      if (sortBy === 'specialty') {
        result = a.specialty.localeCompare(b.specialty)
      }

      if (sortBy === 'experience') {
        const aExp = parseInt(a.experience?.match(/\d+/)?.[0] || 0)
        const bExp = parseInt(b.experience?.match(/\d+/)?.[0] || 0)
        result = aExp - bExp
      }

      return sortOrder === 'asc' ? result : -result
    })

  return (
    <div className='w-full max-w-7xl mx-auto px-4 py-6'>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        {/* HEADER */}
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
                <Scissors className="text-primary" />
                Salon Stylists
              </h1>
              <p className='text-gray-500'>
                Manage professional hairstylists and availability
              </p>
            </div>

            <Link
              to="/add-stylist"
              className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
            >
              <Plus size={18} />
              Add Stylist
            </Link>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30"
              placeholder="Search by name or specialty"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterSpecialty}
              onChange={e => setFilterSpecialty(e.target.value)}
              className="pl-4 pr-8 py-2 border rounded-lg"
            >
              {specialties.map((sp, i) => (
                <option key={i} value={sp}>
                  {sp === 'all' ? 'All Specialties' : sp}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="pl-4 pr-8 py-2 border rounded-lg"
            >
              <option value="name">Sort by Name</option>
              <option value="specialty">Sort by Specialty</option>
              <option value="experience">Sort by Experience</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 border rounded-lg"
              title="Toggle Order"
            >
              <ArrowUpDown size={18} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin h-10 w-10 border-t-2 border-primary rounded-full"></div>
          </div>
        ) : filteredStylists.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No stylists found
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStylists.map(stylist => (
              <div
                key={stylist._id}
                className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition"
              >
                {/* IMAGE */}
                <div className="aspect-[4/3] bg-gray-100">
                  <img
                    src={stylist.image}
                    alt={stylist.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* DETAILS */}
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {stylist.name}
                  </h3>

                  <p className="text-primary text-sm font-medium">
                    {stylist.specialty}
                  </p>

                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Award size={14} />
                    {stylist.experience}
                  </div>

                  {stylist.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      {stylist.phone}
                    </div>
                  )}

                  {stylist.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                      <Mail size={14} />
                      {stylist.email}
                    </div>
                  )}

                  {/* AVAILABILITY */}
                  <div className="pt-3 border-t">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stylist.available}
                        onChange={() => changeAvailability(stylist._id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-checked:bg-primary rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 peer-checked:translate-x-5 transition"></div>
                      </div>
                      <span className="text-sm font-medium">
                        {stylist.available ? 'Currently Available' : 'Not Available'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StylistsList
