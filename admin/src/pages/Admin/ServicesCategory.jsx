import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { Pencil, Plus, Edit, Trash2, X } from 'lucide-react'

const ServiceCategory = () => {
    const [serviceCategories, setServiceCategories] = useState([])
    const [serviceImg, setServiceImg] = useState(false)
    const [serviceName, setServiceName] = useState('')
    const [isEditingService, setIsEditingService] = useState(false)
    const [editServiceId, setEditServiceId] = useState(null)
    const [showServiceForm, setShowServiceForm] = useState(false)

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/services', {
                headers: { aToken }
            })
            if (data.success) {
                setServiceCategories(data.services)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to fetch service categories')
        }
    }

    const handleServiceSubmit = async (e) => {
        e.preventDefault()
        
        try {
            if (!serviceImg && !isEditingService) {
                return toast.error('Service Image Required')
            }

            const formData = new FormData()
            if (serviceImg) {
                formData.append('image', serviceImg)
            }
            formData.append('name', serviceName)

            let response
            if (isEditingService) {
                response = await axios.put(
                    `${backendUrl}/api/admin/services/${editServiceId}`,
                    formData,
                    { headers: { aToken } }
                )
            } else {
                response = await axios.post(
                    `${backendUrl}/api/admin/services`,
                    formData,
                    { headers: { aToken } }
                )
            }

            const { data } = response
            if (data.success) {
                toast.success(data.message)
                resetServiceForm()
                fetchServices()
                setShowServiceForm(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong')
            console.log(error)
        }
    }

    const handleEditService = (service) => {
        setServiceName(service.name)
        setEditServiceId(service._id)
        setIsEditingService(true)
        setShowServiceForm(true)
    }

    const handleDeleteService = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                const { data } = await axios.delete(`${backendUrl}/api/admin/services/${id}`, {
                    headers: { aToken }
                })
                if (data.success) {
                    toast.success(data.message)
                    fetchServices()
                } else {
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error('Failed to delete service')
                console.log(error)
            }
        }
    }

    const resetServiceForm = () => {
        setServiceImg(false)
        setServiceName('')
        setIsEditingService(false)
        setEditServiceId(null)
    }

    return (
        <div className='m-5 w-full'>
            {!showServiceForm && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className='text-2xl font-medium text-gray-800'>Service Categories</h2>
                        <button 
                            onClick={() => {
                                resetServiceForm()
                                setShowServiceForm(true)
                            }}
                            className="bg-primary text-white p-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            <span>Add Service</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {serviceCategories.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {serviceCategories.map((service) => (
                                        <tr key={service._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                                                    <img 
                                                        className="w-full h-full object-cover" 
                                                        src={service.imageUrl} 
                                                        alt={service.name} 
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {service.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={() => handleEditService(service)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteService(service._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No service categories found. Add one to get started.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showServiceForm && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className='text-2xl font-medium text-gray-800'>
                            {isEditingService ? 'Edit Service Category' : 'Add Service Category'}
                        </h2>
                        <button 
                            onClick={() => setShowServiceForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleServiceSubmit} className="max-w-2xl">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative mb-3">
                                <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 border-2 border-gray-200">
                                    <img 
                                        className="w-full h-full object-cover" 
                                        src={serviceImg ? URL.createObjectURL(serviceImg) : (isEditingService ? `${backendUrl}/uploads/services/${editServiceId}.jpg` : assets.upload_area)} 
                                        alt="Service image" 
                                    />
                                </div>
                                <label htmlFor="service-img" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer">
                                    <Pencil size={16} />
                                </label>
                                <input 
                                    onChange={(e) => setServiceImg(e.target.files[0])} 
                                    type="file" 
                                    id="service-img" 
                                    hidden 
                                />
                            </div>
                            <p className="text-gray-500 text-sm">Upload service category image</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                            <input 
                                type="text"
                                value={serviceName}
                                onChange={(e) => setServiceName(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
                                placeholder="e.g. Haircut, Coloring, Styling"
                                required
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button 
                                type="button"
                                onClick={() => setShowServiceForm(false)}
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="bg-primary px-4 py-2 text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                                {isEditingService ? 'Update Service' : 'Add Service'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default ServiceCategory;
