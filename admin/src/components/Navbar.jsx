import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'

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

  // return (
  //   <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
  //     <div className='flex items-center gap-2 text-xs'>
  //       <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
  //       <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Doctor'}</p>
  //     </div>
  //     <button onClick={() => logout()} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>Logout</button>
  //   </div>
  // )
  return (
  <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
    
    {/* Text Logo */}
    <div
      onClick={() => navigate('/')}
className='cursor-pointer hover:opacity-80 transition'
    >
      <h1 className='text-xl sm:text-2xl font-bold text-blue-600'>
        BuildMyWeb
      </h1>
     <span className='text-xs tracking-wide  text-gray-400'>
  Admin Panel
</span>

      
    </div>

    {/* Right Section */}
    <div className='flex items-center gap-4'>
      {/* <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600 text-xs'>
        {aToken ? 'Admin' : 'Doctor'}
      </p> */}
      <button
        onClick={() => logout()}
        className='bg-primary text-white text-sm px-10 py-2 rounded-full'
      >
        Logout
      </button>
    </div>

  </div>
)

}

export default Navbar