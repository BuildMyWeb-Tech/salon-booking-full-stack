import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorProfile = () => {

    const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
    const { currency } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [services, setServices] = useState([])

    // Fetch all services for specialty dropdown
    const fetchServices = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/services')
            if (data.success) {
                setServices(data.services)
            }
        } catch (error) {
            console.log('Error fetching services:', error)
        }
    }

    const updateProfile = async () => {
        try {
            const updateData = {
                address: profileData.address,
                fees: profileData.price || profileData.fees,
                available: profileData.available
            }

            const { data } = await axios.post(
                backendUrl + '/api/doctor/update-profile', 
                updateData, 
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                getProfileData()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    // Toggle specialty selection
    const toggleSpecialty = (serviceName) => {
        if (!isEdit) return

        setProfileData(prev => {
            const currentSpecialty = Array.isArray(prev.specialty) ? prev.specialty : []
            
            if (currentSpecialty.includes(serviceName)) {
                return {
                    ...prev,
                    specialty: currentSpecialty.filter(s => s !== serviceName)
                }
            } else {
                return {
                    ...prev,
                    specialty: [...currentSpecialty, serviceName]
                }
            }
        })
    }

    useEffect(() => {
        if (dToken) {
            getProfileData()
            fetchServices()
        }
    }, [dToken])

    return profileData && (
        <div className='max-w-6xl mx-auto'>
            <div className='flex flex-col gap-4 m-5'>
                
                {/* Profile Image */}
                <div>
                    <img 
                        className='bg-primary/80 w-full sm:max-w-64 rounded-lg object-cover' 
                        src={profileData.image} 
                        alt={profileData.name} 
                    />
                </div>

                <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>

                    {/* Stylist Info: name, specialty, experience */}
                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>
                        {profileData.name}
                    </p>
                    
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{profileData.email}</p>
                    </div>

                    {/* Phone Number */}
                    {profileData.phone && (
                        <div className='mt-2 text-gray-600'>
                            <span className='font-medium'>Phone:</span> {profileData.phone}
                        </div>
                    )}

                    {/* Certification & Experience */}
                    <div className='flex items-center gap-2 mt-3 text-gray-600'>
                        <p className='font-medium'>{profileData.certification || 'Certified'}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>
                            {profileData.experience}
                        </button>
                    </div>

                    {/* Specialization / Services */}
                    <div className='mt-4'>
                        <p className='font-medium text-gray-700 mb-2'>Specialization:</p>
                        {isEdit ? (
                            <div className='flex flex-wrap gap-2'>
                                {services.map((service) => {
                                    const isSelected = Array.isArray(profileData.specialty) && 
                                                      profileData.specialty.includes(service.name)
                                    return (
                                        <button
                                            key={service._id}
                                            onClick={() => toggleSpecialty(service.name)}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                isSelected 
                                                    ? 'bg-primary text-white border-primary' 
                                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            } border`}
                                        >
                                            {service.name}
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className='flex flex-wrap gap-2'>
                                {Array.isArray(profileData.specialty) ? (
                                    profileData.specialty.map((spec, idx) => (
                                        <span key={idx} className='px-3 py-1 bg-primary/10 text-primary rounded-full text-sm'>
                                            {spec}
                                        </span>
                                    ))
                                ) : (
                                    <span className='px-3 py-1 bg-primary/10 text-primary rounded-full text-sm'>
                                        {profileData.specialty || profileData.speciality || 'Not specified'}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Instagram Handle */}
                    {profileData.instagram && (
                        <div className='mt-3'>
                            <a 
                                href={`https://instagram.com/${profileData.instagram.replace('@', '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='text-primary hover:underline flex items-center gap-1'
                            >
                                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/>
                                </svg>
                                {profileData.instagram}
                            </a>
                        </div>
                    )}

                    {/* Working Hours */}
                    {profileData.workingHours && (
                        <div className='mt-3 text-gray-600'>
                            <span className='font-medium'>Working Hours:</span> {profileData.workingHours}
                        </div>
                    )}

                    {/* About Section */}
                    <div className='mt-4'>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mb-1'>About:</p>
                        {isEdit ? (
                            <textarea 
                                onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))} 
                                className='w-full outline-primary p-2 border rounded' 
                                rows={8} 
                                value={profileData.about}
                            />
                        ) : (
                            <p className='text-sm text-gray-600 max-w-[700px]'>
                                {profileData.about}
                            </p>
                        )}
                    </div>

                    {/* Service Fee */}
                    <p className='text-gray-600 font-medium mt-4'>
                        Service fee: <span className='text-gray-800'>
                            {currency} {isEdit ? (
                                <input 
                                    type='number' 
                                    onChange={(e) => setProfileData(prev => ({ 
                                        ...prev, 
                                        fees: e.target.value, 
                                        price: e.target.value 
                                    }))} 
                                    value={profileData.fees || profileData.price}
                                    className='border rounded px-2 py-1 w-24'
                                />
                            ) : (
                                profileData.fees || profileData.price
                            )}
                        </span>
                    </p>

                    {/* Address */}
                    <div className='flex gap-2 py-2 mt-2'>
                        <p className='font-medium'>Address:</p>
                        <p className='text-sm'>
                            {isEdit ? (
                                <>
                                    <input 
                                        type='text' 
                                        onChange={(e) => setProfileData(prev => ({ 
                                            ...prev, 
                                            address: { ...prev.address, line1: e.target.value } 
                                        }))} 
                                        value={profileData.address?.line1 || ''}
                                        className='border rounded px-2 py-1 w-full mb-2'
                                        placeholder='Address Line 1'
                                    />
                                    <input 
                                        type='text' 
                                        onChange={(e) => setProfileData(prev => ({ 
                                            ...prev, 
                                            address: { ...prev.address, line2: e.target.value } 
                                        }))} 
                                        value={profileData.address?.line2 || ''}
                                        className='border rounded px-2 py-1 w-full'
                                        placeholder='Address Line 2'
                                    />
                                </>
                            ) : (
                                <>
                                    {profileData.address?.line1}
                                    <br />
                                    {profileData.address?.line2}
                                </>
                            )}
                        </p>
                    </div>

                    {/* Availability Toggle */}
                    <div className='flex gap-2 items-center pt-2'>
                        <input 
                            type="checkbox" 
                            id="available"
                            onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} 
                            checked={profileData.available}
                            disabled={!isEdit}
                            className='cursor-pointer'
                        />
                        <label htmlFor="available" className='cursor-pointer'>Available for appointments</label>
                    </div>

                    {/* Edit/Save Button */}
                    {isEdit ? (
                        <div className='flex gap-2 mt-5'>
                            <button 
                                onClick={updateProfile} 
                                className='px-6 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all'
                            >
                                Save Changes
                            </button>
                            <button 
                                onClick={() => {
                                    setIsEdit(false)
                                    getProfileData() // Reset to original data
                                }} 
                                className='px-6 py-2 border border-gray-300 text-sm rounded-full hover:bg-gray-50 transition-all'
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsEdit(true)} 
                            className='px-6 py-2 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
                        >
                            Edit Profile
                        </button>
                    )}

                </div>
            </div>
        </div>
    )
}

export default DoctorProfile