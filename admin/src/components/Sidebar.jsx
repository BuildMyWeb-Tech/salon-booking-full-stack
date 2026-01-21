import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';

import {
  Home,
  Calendar,
  UserPlus2,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  Cog,
  MenuIcon,
  X,
  Scissors,LayoutGrid ,CalendarClock, CreditCard, Users 
} from "lucide-react";

const iconClass = "min-w-[23px] w-[23px] h-[23px]";

const Sidebar = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <div className="fixed top-2 left-2 z-50 md:hidden">
        <button 
          onClick={() => setMobileOpen(true)}
          className="bg-white p-2 rounded-full shadow-md text-primary hover:bg-gray-50 transition-all"
        >
          {!mobileOpen && <MenuIcon size={24} />}
        </button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div 
        className={`hidden md:flex flex-col bg-white border-r h-screen shadow-sm fixed z-40 
        transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Desktop Logo */}
        <div className="py-5 px-6 border-b flex justify-between items-center">
          {!collapsed ? (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                StyleStudio
              </h2>
              <p className="text-xs text-gray-400">Stylist Admin</p>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Scissors className="text-primary" size={24} />
            </div>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-primary p-1 rounded-md hover:bg-gray-100 transition-all"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Desktop Menu */}
        {aToken && (
          <ul className="text-[#515151] mt-5 flex flex-col gap-1">
            
            {/* Dashboard */}
            <li>
              <NavLink to="/" className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-5 ${collapsed ? "justify-center" : ""}
                 ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
              }>
                <Home className={iconClass} />
                {!collapsed && <p>Dashboard</p>}
              </NavLink>
            </li>

            {/* Appointments */}
            <li>
              <NavLink to="/all-appointments" className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-5 ${collapsed ? "justify-center" : ""}
                 ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
              }>
                <Calendar className={iconClass} />
                {!collapsed && <p>Appointments</p>}
              </NavLink>
            </li>

            {/* Stylists */}
            <li>
              <NavLink to="/stylist-list" className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-5 ${collapsed ? "justify-center" : ""}
                ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
              }>
                <Scissors   className={iconClass} />
                {!collapsed && <p>Stylists</p>}
              </NavLink>
            </li>

            {/* Add Stylist */}
            <li>
              <NavLink to="/add-stylist" className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-5 ${collapsed ? "justify-center" : ""}
                ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
              }>
                <UserPlus2 className={iconClass} />
                {!collapsed && <p>Add Stylist</p>}
              </NavLink>
            </li>

            {/* Services Category */}
            <li>
              <NavLink
                to="/services-category"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5 ${collapsed ? "justify-center" : ""}
                  ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
                }
              >
                <LayoutGrid className={iconClass} />
                {!collapsed && <p>Services Category</p>}
              </NavLink>
            </li>


            {/* Slot Management */}
            <li>
              <NavLink
                to="/slot-management"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5 ${collapsed ? "justify-center" : ""}
                  ${isActive
                    ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary'
                    : 'hover:bg-gray-50'}`
                }
              >
                <CalendarClock className={iconClass} />
                {!collapsed && <p>Slot Management</p>}
              </NavLink>
            </li>

            {/* Payments */}
            <li>
              <NavLink
                to="/payments"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5 ${collapsed ? "justify-center" : ""}
                  ${isActive
                    ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary'
                    : 'hover:bg-gray-50'}`
                }
              >
                <CreditCard className={iconClass} />
                {!collapsed && <p>Payments</p>}
              </NavLink>
            </li>

            {/* Customerss */}
            <li>
              <NavLink
                to="/Customers"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5 ${collapsed ? "justify-center" : ""}
                  ${isActive
                    ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary'
                    : 'hover:bg-gray-50'}`
                }
              >
                <Users className={iconClass} />
                {!collapsed && <p>Customers</p>}
              </NavLink>
            </li>


            {/* Settings */}
            <li>
              <NavLink to="/my-profile" className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-5 ${collapsed ? "justify-center" : ""}
                ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
              }>
                <Cog className={iconClass} />
                {!collapsed && <p>Settings</p>}
              </NavLink>
            </li>

          </ul>
        )}
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      <div className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 
        ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      >
        {/* MOBILE SIDEBAR PANEL */}
        <div 
          className={`absolute top-0 left-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Mobile Header */}
          <div className="py-5 px-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                StyleStudio
              </h2>
              <p className="text-xs text-gray-400">Stylist Admin</p>
            </div>

            {/* ALWAYS show X when mobileOpen */}
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-600 hover:text-primary p-1 rounded-full hover:bg-gray-100 transition"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          <ul className="text-[#515151] mt-5 flex flex-col gap-1">

            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5
                   ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <Home className={iconClass} />
                <p>Dashboard</p>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/all-appointments" 
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5
                   ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <Calendar className={iconClass} />
                <p>Appointments</p>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/stylist-list" 
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5
                   ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <Scissors  className={iconClass} />
                <p>Stylists</p>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/add-stylist" 
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5
                   ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <UserPlus2 className={iconClass} />
                <p>Add Stylist</p>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/services-category"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5
                  ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <LayoutGrid className={iconClass} />
                <p>Services Category</p>
              </NavLink>
            </li>


            {/* Slot Management */}
            <li>
              <NavLink
                to="/slot-management"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5
                  ${isActive
                    ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary'
                    : 'hover:bg-gray-50'}`
                }
              >
                <CalendarClock className={iconClass} />
                <p>Slot Management</p>
              </NavLink>
            </li>

            {/* Payments */}
            <li>
              <NavLink
                to="/payments"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5
                  ${isActive
                    ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary'
                    : 'hover:bg-gray-50'}`
                }
              >
                <CreditCard className={iconClass} />
                <p>Payments</p>
              </NavLink>
            </li>

            {/* Customerss */}
            <li>
              <NavLink
                to="/Customers"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5
                  ${isActive
                    ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary'
                    : 'hover:bg-gray-50'}`
                }
              >
                <Users className={iconClass} />
                <p>Customers</p>
              </NavLink>
            </li>


            <li>
              <NavLink 
                to="/my-profile" 
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3.5 px-5
                   ${isActive ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-gray-50'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <Cog className={iconClass} />
                <p>Settings</p>
              </NavLink>
            </li>

          </ul>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      {!mobileOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl py-2 z-30">
          <div className="flex justify-around">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-gray-500'}`
              }
            >
              <Home className="w-6 h-6" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink 
              to="/all-appointments" 
              className={({ isActive }) => 
                `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-gray-500'}`
              }
            >
              <Calendar className="w-6 h-6" />
              <span>Appointments</span>
            </NavLink>

            <NavLink 
              to="/stylist-list" 
              className={({ isActive }) => 
                `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-gray-500'}`
              }
            >
              <Scissors   className="w-6 h-6" />
              <span>Stylists</span>
            </NavLink>

            {/* <NavLink 
              to="/add-stylist" 
              className={({ isActive }) => 
                `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-gray-500'}`
              }
            >
              <UserPlus2 className="w-6 h-6" />
              <span>Add Stylist</span>
            </NavLink> */}

            {/* Slot Management */}
            <NavLink
              to="/slot-management"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`
              }
            >
              <CalendarClock className="w-6 h-6" />
              <span>Slots</span>
            </NavLink>

            {/* Payments */}
            <NavLink
              to="/payments"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`
              }
            >
              <CreditCard className="w-6 h-6" />
              <span>Payments</span>
            </NavLink>

            {/* Customers */}
            {/* <NavLink
              to="/Customers"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`
              }
            >
              <Users className="w-6 h-6" />
              <span>Customerss</span>
            </NavLink>


            <NavLink 
              to="/my-profile" 
              className={({ isActive }) => 
                `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-gray-500'}`
              }
            >
              <Cog className="w-6 h-6" />
              <span>Settings</span>
            </NavLink> */}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
