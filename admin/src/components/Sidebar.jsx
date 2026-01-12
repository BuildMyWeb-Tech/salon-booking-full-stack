import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import {
  LayoutDashboard,
  CalendarClock,
  UserPlus,
  Scissors,
  Users,
  User,
  Palette,
  ImagePlus,
  DollarSign,
  Settings,
  ShoppingBag
} from "lucide-react";

const iconClass = "min-w-[23px] w-[23px] h-[23px]";

const Sidebar = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  return (
    <div className="min-h-screen bg-white border-r">
      {/* LOGO AREA */}
      <div className="py-5 px-6 border-b">
        <h2 className="text-lg font-bold text-gray-800 hidden md:block">StyleStudio</h2>
        <h2 className="text-lg font-bold text-gray-800 md:hidden">SS</h2>
      </div>

      {/* ADMIN SIDEBAR */}
      {aToken && (
        <ul className="text-[#515151] mt-5">
          <NavLink to="/admin-dashboard" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <LayoutDashboard className={iconClass} />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink to="/all-appointments" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <CalendarClock className={iconClass} />
            <p className="hidden md:block">Bookings</p>
          </NavLink>

          

          
          <NavLink to="/doctor-list" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <Users className={iconClass} />
            <p className="hidden md:block">Stylists</p>
          </NavLink>

          <NavLink to="/add-doctor" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <UserPlus className={iconClass} />
            <p className="hidden md:block">Add Stylist</p>
          </NavLink>

          {/* <NavLink to="/services-category" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <Scissors className={iconClass} />
            <p className="hidden md:block">Services</p>
          </NavLink> */}


          {/* <NavLink to="/portfolio" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <ImagePlus className={iconClass} />
            <p className="hidden md:block">Portfolio</p>
          </NavLink>

          <NavLink to="/products" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <ShoppingBag className={iconClass} />
            <p className="hidden md:block">Products</p>
          </NavLink> 

          <NavLink to="/finances" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <DollarSign className={iconClass} />
            <p className="hidden md:block">Finances</p>
          </NavLink>*/}
        </ul>
      )}

      {/* STYLIST SIDEBAR (formerly DOCTOR SIDEBAR) */}
      {/* {dToken && (
        <ul className="text-[#515151] mt-5">
          <NavLink to="/stylist-dashboard" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <LayoutDashboard className={iconClass} />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink to="/stylist-appointments" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <CalendarClock className={iconClass} />
            <p className="hidden md:block">My Bookings</p>
          </NavLink>

          <NavLink to="/stylist-services" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <Scissors className={iconClass} />
            <p className="hidden md:block">My Services</p>
          </NavLink>

          <NavLink to="/stylist-portfolio" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <Palette className={iconClass} />
            <p className="hidden md:block">My Portfolio</p>
          </NavLink>

          <NavLink to="/stylist-clients" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <Users className={iconClass} />
            <p className="hidden md:block">My Clients</p>
          </NavLink>

          <NavLink to="/stylist-profile" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <User className={iconClass} />
            <p className="hidden md:block">Profile</p>
          </NavLink>

          <NavLink to="/stylist-settings" className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
            ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
          }>
            <Settings className={iconClass} />
            <p className="hidden md:block">Settings</p>
          </NavLink>
        </ul>
      )} */}
    </div>
  );
};

export default Sidebar;
