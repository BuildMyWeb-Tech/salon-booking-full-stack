import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { 
  Home, 
  LayoutGrid, 
  Calendar, 
  CalendarCheck, 
  User, 
  Scissors, 
  FileText, 
  Phone, 
  X, 
  Menu, 
  Download,
  Smartphone,
  UserCog,
  ArrowDown,
  LogOut,
  Bell,
  ChevronDown,
  Globe,
  CircleUser,
  BookOpen,
  Sparkles
} from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const { token, setToken, userData } = useContext(AppContext)

  // Check if PWA is already installed
  const isPWAInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  // Capture install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    navigate('/login')
  }

  // Install app function
  const installApp = async () => {
    if (!installPrompt) {
      alert('App installation is not available on this device/browser')
      return
    }

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice

    if (choice.outcome === 'accepted') {
      localStorage.setItem('app_installed', 'true')
      setInstallPrompt(null)
    }
  }

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg py-2' : 'bg-white/90 backdrop-blur-sm py-3'}`}>
        <div className='container mx-auto px-4 flex items-center justify-between'>
          {/* Logo */}
          <h1
            onClick={() => navigate('/')}
            className='text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent cursor-pointer'
          >
            StyleStudio
          </h1>
          
          {/* Desktop Navigation */}
          <ul className='hidden md:flex items-center gap-8 font-medium'>
            <NavLink to='/' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                HOME
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/' ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
            <NavLink to='/stylists' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                STYLISTS
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/stylists' ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
            <NavLink to='/services' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                SERVICES
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/services' ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
            <NavLink to='/about' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                ABOUT
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/about' ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
            <NavLink to='/contact' className={({isActive}) => isActive ? 'text-primary' : 'hover:text-primary transition-colors'}>
              <li className='py-1 relative group'>
                CONTACT
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/contact' ? 'w-full' : 'group-hover:w-full'}`}></span>
              </li>
            </NavLink>
            
            {/* Download App NavItem - Added after contact as requested */}
            {!isPWAInstalled && installPrompt && (
              <li 
                onClick={installApp}
                className="py-1 cursor-pointer text-primary flex items-center gap-1 group"
              >
                <span>DOWNLOAD APP</span>
                <Download size={16} className="group-hover:animate-bounce" />
              </li>
            )}
          </ul>

          {/* Desktop User Menu/Login */}
          <div className='hidden md:flex items-center gap-4'>
            {token && userData ? (
              <div className='user-dropdown-container relative'>
                <div 
                  className='flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors border'
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <div className='w-8 h-8 rounded-full overflow-hidden border border-primary/30 bg-gray-100 flex-shrink-0'>
                    <img className='w-full h-full object-cover' src={userData.image || assets.avatar} alt="" />
                  </div>
                  <span className="font-medium text-gray-700 hidden lg:block text-sm">{userData.name?.split(' ')[0]}</span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </div>
                
                {/* Dropdown menu */}
                {showUserDropdown && (
                  <div className='absolute top-full right-0 mt-2 text-base text-gray-600 z-20 w-64 animate-fadeIn'>
                    <div className='bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden'>
                      <div className='px-5 py-4 border-b bg-gray-50'>
                        <p className='font-semibold text-gray-800'>{userData.name}</p>
                        <p className='text-sm text-gray-500'>{userData.email}</p>
                      </div>
                      <div className='p-2'>
                        <NavLink 
                          to='/my-profile' 
                          className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors'
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <CircleUser size={18} className="text-primary" />
                          <span>My Profile</span>
                        </NavLink>
                        <NavLink 
                          to='/my-appointments' 
                          className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors'
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Calendar size={18} className="text-primary" />
                          <span>My Appointments</span>
                        </NavLink>
                        <button 
                          onClick={() => {
                            logout();
                            setShowUserDropdown(false);
                          }}
                          className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-500 w-full text-left transition-colors'
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className='bg-primary text-white px-5 py-2 rounded-full hover:bg-primary/90 shadow-md shadow-primary/20 transition-all duration-300 flex items-center gap-2 font-medium'
              >
                <User size={18} />
                <span>Login / Register</span>
              </button>
            )}
          </div>
          
          {/* Mobile Install App + Menu Buttons */}
          <div className='md:hidden flex items-center gap-2'>
            {/* Download App Button */}
            {!isPWAInstalled && installPrompt && (
              <button
                onClick={installApp}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
                aria-label="Install App"
              >
                <Download size={20} />
                
              </button>
              
            )}
            
            {/* Menu Button */}
            <button 
              onClick={() => setShowMenu(true)} 
              className='flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
              aria-label="Open Menu"
            >
              <Menu size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowMenu(false)}
        ></div>
      )}

      {/* Mobile Side Menu */}
      <div className={`fixed top-0 bottom-0 right-0 w-4/5 max-w-sm bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-5 border-b'>
            <h1 className='text-2xl font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent'>
              StyleStudio
            </h1>
            <button 
              onClick={() => setShowMenu(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>
          
          {/* User Info (if logged in) */}
          {token && userData && (
            <div className='p-5 border-b bg-gray-50'>
              <div className='flex items-center gap-3'>
                <div className='w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 bg-gray-100'>
                  <img className='w-full h-full object-cover' src={userData.image || assets.avatar} alt={userData.name} />
                </div>
                <div>
                  <p className='font-medium text-gray-800'>{userData.name}</p>
                  <p className='text-sm text-gray-500'>{userData.email}</p>
                </div>
              </div>
              
              {/* App install button beneath user profile */}
              {!isPWAInstalled && installPrompt && (
                <button 
                  onClick={() => {
                    installApp();
                    setShowMenu(false);
                  }}
                  className='mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-sm font-medium'
                >
                  <Smartphone size={16} />
                  <span>Download Our App</span>
                </button>
              )}
            </div>
          )}
          
          {/* Menu Items */}
          <div className='flex-1 overflow-y-auto p-4'>
            <ul className='space-y-1'>
              <NavLink 
                to='/' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setShowMenu(false)}
              >
                <Home size={20} />
                <span>Home</span>
              </NavLink>
              
              <NavLink 
                to='/services' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setShowMenu(false)}
              >
                <Scissors size={20} />
                <span>Services</span>
              </NavLink>
              
              <NavLink 
                to='/stylists' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setShowMenu(false)}
              >
                <UserCog size={20} />
                <span>Stylists</span>
              </NavLink>
              
              {token && userData && (
                <NavLink 
                  to='/my-appointments' 
                  className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setShowMenu(false)}
                >
                  <Calendar size={20} />
                  <span>My Appointments</span>
                </NavLink>
              )}
              
              <NavLink 
                to='/about' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setShowMenu(false)}
              >
                <BookOpen size={20} />
                <span>About Us</span>
              </NavLink>
              
              <NavLink 
                to='/contact' 
                className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setShowMenu(false)}
              >
                <Phone size={20} />
                <span>Contact</span>
              </NavLink>
              
              {token && userData && (
                <NavLink 
                  to='/my-profile' 
                  className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setShowMenu(false)}
                >
                  <User size={20} />
                  <span>My Profile</span>
                </NavLink>
              )}
            </ul>
            
            {/* Promotion in menu */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-primary" />
                <span className="font-medium text-gray-800">Special Offers</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Book a premium styling session today and get 20% off on your first visit!</p>
              <button 
                onClick={() => {
                  navigate('/stylists');
                  setShowMenu(false);
                }}
                className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium"
              >
                Book Now
              </button>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className='p-5 border-t'>
            {token && userData ? (
              <button 
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className='w-full py-3 text-center text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2'
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  navigate('/login');
                  setShowMenu(false);
                }}
                className='w-full py-3 text-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2'
              >
                <User size={18} />
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30 px-2 py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around">
          <NavLink to="/" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </NavLink>

          <NavLink to="/services" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
            <Scissors size={20} />
            <span className="text-xs mt-1">Services</span>
          </NavLink>

          {/* Download App in Mobile Bottom Nav */}
          {/* {!isPWAInstalled && installPrompt && (
            <button
              onClick={installApp}
              className="flex flex-col items-center p-1 text-primary"
            >
              <Download size={20} />
              <span className="text-xs mt-1">Get App</span>
            </button>
          )} */}

          <NavLink to="/stylists" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
            <UserCog size={20} />
            <span className="text-xs mt-1">Stylists</span>
          </NavLink>

          <NavLink to="/my-appointments" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
            <Calendar size={20} />
            <span className="text-xs mt-1">Bookings</span>
          </NavLink>

          {token && userData ? (
            <NavLink to="/my-profile" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
              <User size={20} />
              <span className="text-xs mt-1">Profile</span>
            </NavLink>
          ) : (
            <NavLink to="/login" className={({isActive}) => `flex flex-col items-center p-1 ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
              <User size={20} />
              <span className="text-xs mt-1">Login</span>
            </NavLink>
          )}
        </div>
      </div>
      
      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
      {/* Spacer for bottom nav on mobile */}
      <div className=" md:h-0"></div>
    </>
  )
}

export default Navbar
