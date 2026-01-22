import React, { useContext, useState, useEffect } from 'react'
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
    const [submitting, setSubmitting] = useState(false)

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        setLoading(true)
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/admin/services`,
                { headers: { aToken } }
            )
            if (data.success) {
                setServiceCategories(data.services)
            }
        } catch (error) {
            toast.error('Failed to fetch service categories')
        } finally {
            setLoading(false)
        }
    }

    const handleServiceSubmit = async (e) => {
    e.preventDefault();
    
    try {
        if (!serviceImg && !isEditingService) {
            return toast.error('Service Image Required');
        }

        const formData = new FormData();
        if (serviceImg) {
            formData.append('image', serviceImg);
        }
        formData.append('name', serviceName);
        formData.append('description', serviceDescription);
        formData.append('basePrice', basePrice);

        let response;
        if (isEditingService) {
            response = await axios.put(
                `${backendUrl}/api/admin/services/${editServiceId}`,
                formData,
                { headers: { aToken } }
            );
        } else {
            response = await axios.post(
                `${backendUrl}/api/admin/services`,
                formData,
                { headers: { aToken } }
            );
        }

        const { data } = response;
        if (data.success) {
            toast.success(data.message);
            resetServiceForm();
            fetchServices();
            setShowServiceForm(false);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message || 'Something went wrong');
        console.log(error);
    }
};

   // Update handleEditService to include basePrice
const handleEditService = (service) => {
    setServiceName(service.name);
    setServiceDescription(service.description || '');
    setBasePrice(service.basePrice || '');
    setEditServiceId(service._id);
    setIsEditingService(true);
    setShowServiceForm(true);
};

    const handleDeleteService = async (id) => {
        if (!window.confirm('Delete this service category?')) return

        try {
            const { data } = await axios.delete(
                `${backendUrl}/api/admin/services/${id}`,
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                fetchServices()
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error('Failed to delete service')
        }
    }

    const resetServiceForm = () => {
    setServiceImg(false);
    setServiceName('');
    setServiceDescription('');
    setBasePrice('');
    setIsEditingService(false);
    setEditServiceId(null);
};

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
                ) : serviceCategories.length ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium">Description</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y">
                                {serviceCategories.map(service => (
                                    <tr key={service._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <img
                                                src={service.imageUrl}
                                                alt={service.name}
                                                className="w-16 h-16 rounded-md object-cover"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {service.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            ₹{service.basePrice}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-md line-clamp-2">
                                            {service.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleEditService(service)}
                                                    className="p-2 bg-blue-50 rounded-full text-blue-600"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteService(service._id)}
                                                    className="p-2 bg-red-50 rounded-full text-red-600"
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
                    <div className="text-center py-20">
                        <ScissorsIcon size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-4">No Service Categories Yet</p>
                        <button
                            onClick={() => setShowServiceForm(true)}
                            className="bg-primary text-white px-4 py-2 rounded"
                        >
                            Add First Service
                        </button>
                    </div>
                )}
            </div>
        )}

        {showServiceForm && (
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="p-6 border-b flex justify-between">
                    <h2 className="text-xl font-bold">
                        {isEditingService ? 'Edit Service Category' : 'Add New Service Category'}
                    </h2>
                    <button onClick={() => setShowServiceForm(false)}>
                        <X />
                    </button>
                </div>

                <form onSubmit={handleServiceSubmit} className="p-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Image */}
                        <div className="flex flex-col items-center">
                            <div className="w-40 h-40 border-2 border-dashed rounded-lg overflow-hidden">
                                {serviceImg ? (
                                    <img
                                        src={URL.createObjectURL(serviceImg)}
                                        className="w-full h-full object-cover"
                                    />
                                ) : isEditingService ? (
                                    <img
                                        src={serviceCategories.find(s => s._id === editServiceId)?.imageUrl}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        Upload Image
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setServiceImg(e.target.files[0])}
                                className="mt-3"
                            />
                        </div>

                        {/* Fields */}
                        <div className="md:col-span-2">
                            <input
                                value={serviceName}
                                onChange={e => setServiceName(e.target.value)}
                                placeholder="Service Name"
                                className="w-full mb-4 border p-3 rounded"
                                required
                            />

                            <input
                                type="number"
                                value={basePrice}
                                onChange={e => setBasePrice(e.target.value)}
                                placeholder="Base Price"
                                className="w-full mb-4 border p-3 rounded"
                                required
                            />

                            <textarea
                                value={serviceDescription}
                                onChange={e => setServiceDescription(e.target.value)}
                                placeholder="Description"
                                rows={5}
                                className="w-full border p-3 rounded"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowServiceForm(false)}
                            className="border px-5 py-2 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary text-white px-5 py-2 rounded"
                        >
                            {submitting ? 'Saving...' : isEditingService ? 'Update Service' : 'Add Service'}
                        </button>
                    </div>
                </form>
            </div>
        )}
    </div>
)

}

export default ServiceCategory
