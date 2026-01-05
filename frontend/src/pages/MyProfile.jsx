import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Pencil } from 'lucide-react'
import { assets } from '../assets/assets'

const MyProfile = () => {

  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)

  const {
    token,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData
  } = useContext(AppContext)

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData()

      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)
      image && formData.append('image', image)

      const { data } = await axios.post(
        backendUrl + '/api/user/update-profile',
        formData,
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.error(error)
      toast.error("Profile update failed")
    }
  }

  if (!userData) return null

  return (
    <div className="max-w-3xl mx-auto pt-8 px-4">

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex gap-6 items-center">

        {/* PROFILE IMAGE */}
        <div className="relative">
          <img
            src={image ? URL.createObjectURL(image) : userData.image}
            alt="profile"
            className="w-32 h-32 rounded-full object-cover border"
          />

          {isEdit && (
            <label htmlFor="profile-img" className="absolute bottom-2 right-2 bg-primary p-2 rounded-full cursor-pointer text-white">
              <Pencil size={16} />
              <input
                id="profile-img"
                type="file"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          )}
        </div>

        {/* NAME + EMAIL */}
        <div className="flex-1">
          {isEdit ? (
            <input
              className="text-2xl font-semibold border px-3 py-1 rounded w-full"
              value={userData.name}
              onChange={(e) =>
                setUserData(prev => ({ ...prev, name: e.target.value }))
              }
            />
          ) : (
            <h2 className="text-2xl font-semibold text-gray-800">
              {userData.name}
            </h2>
          )}

          <p className="text-gray-500 mt-1">{userData.email}</p>
        </div>

        {/* ACTION */}
        <div>
          {!isEdit && (
            <button
              onClick={() => setIsEdit(true)}
              className="border border-primary px-5 py-2 rounded-full hover:bg-primary hover:text-white transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* DETAILS */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">

        {/* CONTACT INFO */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Contact Information</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Phone</p>
              {isEdit ? (
                <input
                  className="border px-3 py-1 rounded w-full"
                  value={userData.phone}
                  onChange={(e) =>
                    setUserData(prev => ({ ...prev, phone: e.target.value }))
                  }
                />
              ) : (
                <p>{userData.phone}</p>
              )}
            </div>

            <div>
              <p className="text-gray-500">Address</p>
              {isEdit ? (
                <>
                  <input
                    className="border px-3 py-1 rounded w-full mb-2"
                    value={userData.address.line1}
                    onChange={(e) =>
                      setUserData(prev => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value }
                      }))
                    }
                  />
                  <input
                    className="border px-3 py-1 rounded w-full"
                    value={userData.address.line2}
                    onChange={(e) =>
                      setUserData(prev => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value }
                      }))
                    }
                  />
                </>
              ) : (
                <p className="text-gray-600">
                  {userData.address.line1}<br />
                  {userData.address.line2}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Basic Information</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Gender</p>
              {isEdit ? (
                <select
                  className="border px-3 py-1 rounded w-full"
                  value={userData.gender}
                  onChange={(e) =>
                    setUserData(prev => ({ ...prev, gender: e.target.value }))
                  }
                >
                  <option>Not Selected</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              ) : (
                <p>{userData.gender}</p>
              )}
            </div>

            <div>
              <p className="text-gray-500">Date of Birth</p>
              {isEdit ? (
                <input
                  type="date"
                  className="border px-3 py-1 rounded w-full"
                  value={userData.dob}
                  onChange={(e) =>
                    setUserData(prev => ({ ...prev, dob: e.target.value }))
                  }
                />
              ) : (
                <p>{userData.dob}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      {isEdit && (
        <div className="flex justify-end mt-6">
          <button
            onClick={updateUserProfileData}
            className="bg-primary px-8 py-3 text-white rounded-full hover:bg-primary/90 transition"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}

export default MyProfile
