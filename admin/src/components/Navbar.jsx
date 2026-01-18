import React, { useContext } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, Bell, Search, User } from 'lucide-react'

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  return (
    <div className='sticky top-0 z-30 flex justify-between items-center px-4 sm:px-8 py-3 border-b bg-white shadow-sm'>
      {/* Empty div for spacing on desktop */}
      <div className="w-6 md:w-auto"></div>
      
      {/* Mobile Title - Only visible on mobile */}
      <div className="md:hidden">
        <h1 className='text-lg font-semibold text-primary'>StyleStudio Admin</h1>
      </div>

      {/* Right Section */}
      <div className='flex items-center gap-4'>
        {/* <div className="hidden sm:flex items-center relative mr-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-1.5 text-sm border border-gray-200 rounded-full w-40 lg:w-56 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-500 hover:text-primary transition-colors" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            2
          </span>
        </div> */}

        <div className="hidden sm:flex items-center gap-2 border-l pl-4 ml-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={16} />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500">{aToken ? 'Administrator' : 'Stylist'}</p>
          </div>
        </div>
        
        <button
          onClick={() => logout()}
          className='bg-primary text-white text-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1'
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Navbar
