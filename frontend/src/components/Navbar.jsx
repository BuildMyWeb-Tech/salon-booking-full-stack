import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Home, Grid, Calendar,CalendarCheck , User, Scissors, Info, Phone, X, Menu } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { token, setToken, userData } = useContext(AppContext)

  // Handle scroll event for navbar appearance change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-4'}`}>
        <div className='container mx-auto px-4 flex items-center justify-between'>
          {/* Logo */}
          <img 
            onClick={() => navigate('/')} 
            className='w-44 cursor-pointer' 
            src={assets.logo} 
            alt="StyleStudio Logo" 
          />
          
          {/* Desktop Navigation */}
          <ul className='hidden md:flex items-center gap-8 font-medium'>
            <NavLink to='/' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                HOME
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${isActive('/') ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
            <NavLink to='/doctors' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                STYLISTS
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${isActive('/doctors') ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
            <NavLink to='/services' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                SERVICES
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${isActive('/services') ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
            <NavLink to='/about' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                ABOUT
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${isActive('/about') ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
            <NavLink to='/contact' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                CONTACT
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${isActive('/contact') ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
          </ul>

          {/* Desktop User Menu/Login */}
          <div className='hidden md:flex items-center gap-4'>
            {token && userData ? (
              <div className='flex items-center gap-2 cursor-pointer group relative'>
                <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-primary'>
                  <img className='w-full h-full object-cover' src={userData.image} alt="" />
                </div>
                <span className="font-medium text-gray-700 hidden md:block">{userData.name?.split(' ')[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                
                {/* Dropdown menu */}
                <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
                  <div className='min-w-48 bg-white rounded-lg shadow-lg border flex flex-col overflow-hidden'>
                    <p className='px-6 py-3 font-semibold text-gray-500 bg-gray-50 border-b'>{userData.name}</p>
                    <NavLink to='/my-profile' className='px-6 py-3 hover:bg-gray-50 hover:text-primary transition-colors'>
                      My Profile
                    </NavLink>
                    <NavLink to='/my-appointments' className='px-6 py-3 hover:bg-gray-50 hover:text-primary transition-colors'>
                      My Appointments
                    </NavLink>
                    <button 
                      onClick={logout} 
                      className='px-6 py-3 text-left hover:bg-gray-50 hover:text-red-500 transition-colors'
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className='bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 font-medium'
              >
                <User size={18} />
                Login / Register
              </button>
            )}
            
            {/* Mobile menu toggle */}
            <button onClick={() => setShowMenu(true)} className='md:hidden flex items-center justify-center'>
              <Menu size={24} className="text-gray-700" />
            </button>
          </div>
          
          {/* Mobile menu toggle - outside the hidden section */}
          <button onClick={() => setShowMenu(true)} className='md:hidden flex items-center justify-center'>
            <Menu size={24} className="text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMenu(false)}
        ></div>
      )}

      {/* Mobile Side Menu */}
      <div className={`fixed top-0 bottom-0 right-0 w-4/5 max-w-sm bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-5 border-b'>
            <img src={assets.logo} className='w-36' alt="StyleStudio Logo" />
            <button onClick={() => setShowMenu(false)}>
              <X size={24} className="text-gray-700" />
            </button>
          </div>
          
          {/* User Info (if logged in) */}
          {token && userData && (
            <div className='p-5 border-b flex items-center gap-3'>
              <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-primary'>
                <img className='w-full h-full object-cover' src={userData.image} alt={userData.name} />
              </div>
              <div>
                <p className='font-medium text-gray-800'>{userData.name}</p>
                <p className='text-sm text-gray-500'>{userData.email}</p>
              </div>
            </div>
          )}
          
          {/* Menu Items */}
          <div className='flex-1 overflow-y-auto p-5'>
            <ul className='space-y-2'>
              <NavLink 
                to='/' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setShowMenu(false)}
              >
                <Home size={20} />
                <span>Home</span>
              </NavLink>
              
              <NavLink 
                to='/services' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setShowMenu(false)}
              >
                <Grid size={20} />
                <span>Services</span>
              </NavLink>
              
              <NavLink 
                to='/doctors' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setShowMenu(false)}
              >
                <Scissors size={20} />
                <span>Stylists</span>
              </NavLink>
              
              {token && userData && (
                <NavLink 
                  to='/my-appointments' 
                  className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setShowMenu(false)}
                >
                  <Calendar size={20} />
                  <span>Appointments</span>
                </NavLink>
              )}
              
              <NavLink 
                to='/about' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setShowMenu(false)}
              >
                <Info size={20} />
                <span>About Us</span>
              </NavLink>
              
              <NavLink 
                to='/contact' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setShowMenu(false)}
              >
                <Phone size={20} />
                <span>Contact</span>
              </NavLink>
              
              {token && userData && (
                <NavLink 
                  to='/my-profile' 
                  className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setShowMenu(false)}
                >
                  <User size={20} />
                  <span>My Profile</span>
                </NavLink>
              )}
            </ul>
          </div>
          
          {/* Footer Actions */}
          <div className='p-5 border-t'>
            {token && userData ? (
              <button 
                onClick={() => {
                  logout()
                  setShowMenu(false)
                }}
                className='w-full py-3 text-center text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors'
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={() => {
                  navigate('/login')
                  setShowMenu(false)
                }}
                className='w-full py-3 text-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30 px-2 py-2">
        <div className="flex justify-around">
          
          <NavLink to="/" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </NavLink>

          <NavLink to="/services" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
            <Grid size={20} />
            <span className="text-xs mt-1">Service</span>
          </NavLink>

          <NavLink to="/doctors" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
            <Scissors size={20} />
            <span className="text-xs mt-1">Stylist</span>
          </NavLink>

          <NavLink to="/my-appointments" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
            <CalendarCheck size={20} />
            <span className="text-xs mt-1">Appointment</span>
          </NavLink>

          <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
        </div>
      </div>
      
      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
      {/* Spacer for bottom nav on mobile */}
      <div className="h-16 md:h-0 mb-5"></div>
    </>
  )
}

export default Navbar
