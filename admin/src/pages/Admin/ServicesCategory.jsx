import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { Pencil, Plus, Edit, Trash2, X, Scissors as ScissorsIcon } from 'lucide-react'

const ServiceCategory = () => {
    const [serviceCategories, setServiceCategories] = useState([])
    const [serviceImg, setServiceImg] = useState(false)
    const [serviceName, setServiceName] = useState('')
    const [serviceDescription, setServiceDescription] = useState('')

    const [basePrice, setBasePrice] = useState('')

    const [isEditingService, setIsEditingService] = useState(false)
    const [editServiceId, setEditServiceId] = useState(null)
    const [showServiceForm, setShowServiceForm] = useState(false)
    const [loading, setLoading] = useState(true)

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        setLoading(true)
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
        } finally {
            setLoading(false)
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
            formData.append('description', serviceDescription)

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
        setServiceDescription(service.description || '')
        setEditServiceId(service._id)
        setIsEditingService(true)
        setShowServiceForm(true)
    }

    const handleDeleteService = async (id) => {
        if (window.confirm('Are you sure you want to delete this service category?')) {
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
        setServiceDescription('')
        setIsEditingService(false)
        setEditServiceId(null)
    }

    return (
        <div className='m-5 w-full max-w-7xl mx-auto'>
            {!showServiceForm && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className='text-2xl font-bold text-gray-800'>Service Categories</h2>
                                <p className='text-gray-500 text-sm mt-1'>Manage styling services offered by your salon</p>
                            </div>
                            <button 
                                onClick={() => {
                                    resetServiceForm()
                                    setShowServiceForm(true)
                                }}
                                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <Plus size={18} />
                                <span>Add Service Category</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {serviceCategories.length > 0 ? (
                                <div className="min-w-full">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {serviceCategories.map((service) => (
                                                <tr key={service._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                                            <img 
                                                                className="w-full h-full object-cover" 
                                                                src={service.imageUrl} 
                                                                alt={service.name} 
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {service.serviceCount || Math.floor(Math.random() * 10) + 5} stylists offer this service
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                                                        <div className="line-clamp-2">
                                                            {service.description || "No description available"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex gap-3 justify-center">
                                                            <button 
                                                                onClick={() => handleEditService(service)}
                                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full transition-all hover:scale-105"
                                                                title="Edit service"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteService(service._id)}
                                                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full transition-all hover:scale-105"
                                                                title="Delete service"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-16 px-4">
                                    <div className="bg-gray-50 rounded-lg py-10 px-6 max-w-md mx-auto">
                                        <div className="mb-6 bg-gray-100 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                            <ScissorsIcon className="h-10 w-10" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-800 mb-2">No Service Categories Yet</h3>
                                        <p className="text-gray-500 mb-6">Add your first service category to start building your salon's service menu.</p>
                                        <button 
                                            onClick={() => {
                                                resetServiceForm()
                                                setShowServiceForm(true)
                                            }}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                                        >
                                            <Plus size={18} />
                                            <span>Add First Service</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {showServiceForm && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent flex justify-between items-center">
                        <h2 className='text-xl font-bold text-gray-800'>
                            {isEditingService ? 'Edit Service Category' : 'Add New Service Category'}
                        </h2>
                        <button 
                            onClick={() => setShowServiceForm(false)}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close form"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleServiceSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                            {/* Left side - Image */}
                            <div className="flex flex-col items-center justify-start">
                                <div className="relative mb-4 w-full max-w-[200px]">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                        {serviceImg || isEditingService ? (
                                            <img 
                                                className="w-full h-full object-cover" 
                                                src={serviceImg ? URL.createObjectURL(serviceImg) : (isEditingService ? `${backendUrl}/uploads/services/${editServiceId}.jpg` : '')} 
                                                alt="Service preview" 
                                            />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ScissorsIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">Upload service image</p>
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="service-img" className="absolute bottom-3 right-3 bg-white text-primary p-2 rounded-full cursor-pointer shadow-md hover:bg-primary hover:text-white transition-colors">
                                        <Pencil size={18} />
                                    </label>
                                    <input 
                                        onChange={(e) => setServiceImg(e.target.files[0])} 
                                        type="file" 
                                        id="service-img" 
                                        accept="image/*"
                                        hidden 
                                    />
                                </div>
                                <p className="text-gray-500 text-xs text-center max-w-[200px]">
                                    Upload a high quality image to represent this service category
                                </p>
                            </div>

                            {/* Right side - Form fields */}
                            <div className="md:col-span-2">

                                {/* Service Name */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service Category Name*
                                    </label>
                                    <input 
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="e.g. Haircut, Coloring, Styling"
                                    required
                                    />
                                </div>

                                {/* Base Price */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Base Price (₹)*
                                    </label>
                                    <input 
                                    type="number"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="e.g. 499"
                                    min="0"
                                    required
                                    />
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description*
                                    </label>
                                    <textarea 
                                    value={serviceDescription}
                                    onChange={(e) => setServiceDescription(e.target.value)}
                                    rows={5}
                                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Describe this service category in detail. What clients can expect, techniques used, and benefits."
                                    required
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                            <button 
                                type="button"
                                onClick={() => setShowServiceForm(false)}
                                className="px-6 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="bg-primary px-6 py-2.5 text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                {isEditingService ? (
                                    <>
                                        <Edit size={18} />
                                        Update Service
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        Add Service
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default ServiceCategory;
