import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import {
  BarChart,
  CalendarClock,
  UserPlus,
  Scissors,
  Users,
  User,
  Palette,
  ImagePlus,
  DollarSign,
  Settings,
  ShoppingBag,
  Home,
  LogOut,
  ChevronRight,
  Menu as MenuIcon,
  X
} from "lucide-react";

const iconClass = "min-w-[23px] w-[23px] h-[23px]";

const Sidebar = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Detect if we're on mobile for initial state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // Admin navigation items
  const adminNavItems = [
    { path: '/', label: 'Dashboard', icon: <BarChart className={iconClass} /> },
    { path: '/all-appointments', label: 'Appointments', icon: <CalendarClock className={iconClass} /> },
    { path: '/stylist-list', label: 'Stylists', icon: <Users className={iconClass} /> },
    { path: '/add-stylist', label: 'Add Stylist', icon: <UserPlus className={iconClass} /> },
    { path: '/my-profile', label: 'My Profile', icon: <User className={iconClass} /> },
    { path: '/services-category', label: 'Services', icon: <Scissors className={iconClass} /> }
  ];

  // Stylist navigation items
  const stylistNavItems = [
    { path: '/stylist-dashboard', label: 'Dashboard', icon: <BarChart className={iconClass} /> },
    { path: '/stylist-appointments', label: 'My Bookings', icon: <CalendarClock className={iconClass} /> },
    { path: '/stylist-services', label: 'My Services', icon: <Scissors className={iconClass} /> },
    { path: '/stylist-portfolio', label: 'My Portfolio', icon: <Palette className={iconClass} /> },
    { path: '/stylist-clients', label: 'My Clients', icon: <Users className={iconClass} /> },
    { path: '/stylist-profile', label: 'Profile', icon: <User className={iconClass} /> },
    { path: '/stylist-settings', label: 'Settings', icon: <Settings className={iconClass} /> },
  ];

  // Determine which nav items to use
  const navItems = aToken ? adminNavItems : dToken ? stylistNavItems : [];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <div className={`hidden md:block fixed left-0 top-0 h-screen z-30 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-full flex flex-col bg-white shadow-md border-r border-gray-100">
          {/* LOGO AREA */}
          <div className="py-5 px-6 border-b flex items-center justify-between">
            {!isCollapsed ? (
              <h2 className="text-lg font-bold text-gray-800">StyleStudio</h2>
            ) : (
              <h2 className="text-lg font-bold text-gray-800">SS</h2>
            )}
            <button 
              onClick={toggleSidebar} 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <ChevronRight 
                className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} 
              />
            </button>
          </div>
          
          {/* NAV ITEMS */}
          <div className="flex-grow overflow-y-auto py-4">
            <ul className="text-[#515151]">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 py-3.5 px-6 cursor-pointer transition-all duration-200
                    ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary text-primary font-medium' : 'hover:bg-gray-50'}
                  `}
                >
                  <div>{item.icon}</div>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </ul>
          </div>
          
          {/* LOGOUT BUTTON */}
          <div className="p-4 border-t">
            <button 
              className={`
                flex items-center gap-3 py-3 px-4 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition-colors
                ${!isCollapsed ? 'justify-start' : 'justify-center'}
              `}
            >
              <LogOut className={iconClass} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">StyleStudio</h2>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>
      
      {/* Mobile Side Drawer */}
      <div className={`
        fixed inset-0 z-40 md:hidden transition-all duration-300 
        ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMobileMenu}
        ></div>
        
        {/* Side drawer */}
        <div className={`
          absolute top-0 right-0 w-3/4 max-w-xs h-full bg-white shadow-xl transform transition-transform
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Menu</h2>
            <button 
              onClick={closeMobileMenu}
              className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="overflow-y-auto h-full pb-20">
            <div className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all duration-200
                      ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 text-gray-700'}
                    `}
                    onClick={closeMobileMenu}
                  >
                    <div>{item.icon}</div>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t">
                <button 
                  className="flex items-center gap-3 py-3 px-4 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className={iconClass} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs transition-colors
                ${isActive ? 'text-primary' : 'text-gray-600'}
              `}
            >
              <div>{item.icon}</div>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      
      {/* Content Spacer for fixed elements */}
      <div className="md:pl-64 pt-14 md:pt-0 pb-16 md:pb-0 transition-all duration-300">
        {isCollapsed && <div className="hidden md:block md:pl-20 transition-all duration-300"></div>}
      </div>
    </>
  );
};

export default Sidebar;
