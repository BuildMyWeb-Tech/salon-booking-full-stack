import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { Pencil } from 'lucide-react'

const AddStylist = () => {
    const [stylistImg, setStylistImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [price, setPrice] = useState('')
    const [about, setAbout] = useState('')
    const [specialty, setSpecialty] = useState('Haircut & Styling')
    const [certification, setCertification] = useState('')
    const [instagram, setInstagram] = useState('')
    const [workingHours, setWorkingHours] = useState('')

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            if (!stylistImg) {
                return toast.error('Profile Image Required')
            }

            const formData = new FormData();

            formData.append('image', stylistImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('price', Number(price))
            formData.append('about', about)
            formData.append('specialty', specialty)
            formData.append('certification', certification)
            formData.append('instagram', instagram)
            formData.append('workingHours', workingHours)

            // console log formdata            
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });

            const { data } = await axios.post(backendUrl + '/api/admin/add-stylist', formData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                setStylistImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setCertification('')
                setAbout('')
                setPrice('')
                setInstagram('')
                setWorkingHours('')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-5 text-2xl font-medium text-gray-800'>Add New Stylist</p>

            <div className='bg-white px-8 py-8 border rounded-lg shadow-sm w-full max-w-4xl max-h-[80vh] overflow-y-auto'>
                <div className='flex flex-col items-center justify-center mb-8'>
                    <div className='relative mb-3'>
                        <div className='w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200'>
                            <img 
                                className='w-full h-full object-cover' 
                                src={stylistImg ? URL.createObjectURL(stylistImg) : assets.upload_area} 
                                alt="Stylist profile" 
                            />
                        </div>
                        <label htmlFor="stylist-img" className='absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer'>
                            <Pencil size={16} />
                        </label>
                        <input onChange={(e) => setStylistImg(e.target.files[0])} type="file" name="" id="stylist-img" hidden />
                    </div>
                    <p className='text-gray-500 text-sm'>Upload stylist profile picture</p>
                </div>

                <div className='flex flex-col lg:flex-row items-start gap-8 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <label className='text-sm font-medium text-gray-700'>Full Name</label>
                            <input 
                                onChange={e => setName(e.target.value)} 
                                value={name} 
                                className='border rounded-md px-3 py-2 focus:outline-none focus:border-primary' 
                                type="text" 
                                placeholder='Enter stylist name' 
                                required 
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label className='text-sm font-medium text-gray-700'>Email Address</label>
                            <input 
                                onChange={e => setEmail(e.target.value)} 
                                value={email} 
                                className='border rounded-md px-3 py-2 focus:outline-none focus:border-primary' 
                                type="email" 
                                placeholder='Enter email address' 
                                required 
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label className='text-sm font-medium text-gray-700'>Password</label>
                            <input 
                                onChange={e => setPassword(e.target.value)} 
                                value={password} 
                                className='border rounded-md px-3 py-2 focus:outline-none focus:border-primary' 
                                type="password" 
                                placeholder='Create password' 
                                required 
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label className='text-sm font-medium text-gray-700'>Experience</label>
                            <select 
                                onChange={e => setExperience(e.target.value)} 
                                value={experience} 
                                className='border rounded-md px-3 py-2 focus:outline-none focus:border-primary' 
                            >
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="4 Years">4 Years</option>
                                <option value="5 Years">5 Years</option>
                                <option value="6-10 Years">6-10 Years</option>
                                <option value="10+ Years">10+ Years</option>
                            </select>
                        </div>

                        
                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <label className='text-sm font-medium text-gray-700'>Specialty</label>
                            <select 
                                onChange={e => setSpecialty(e.target.value)} 
                                value={specialty} 
                                className='border rounded-md px-3 py-2 focus:outline-none focus:border-primary'
                            >
                                <option value="Hair Styling Specialist">Hair Styling Specialist</option>
                                <option value="Beard & Grooming Specialist">Beard & Grooming Specialist</option>
                                <option value="Hair Coloring Specialist">Hair Coloring Specialist</option>
                                <option value="Hair Treatment Specialist">Hair Treatment Specialist</option>
                                <option value="Bridal Hairstylist">Bridal Hairstylist</option>
                                <option value="Unisex Hairstylist">Unisex Hairstylist</option>

                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label className='text-sm font-medium text-gray-700'>Certification</label>
                            <input 
                                onChange={e => setCertification(e.target.value)} 
                                value={certification} 
                                className='border rounded-md px-3 py-2 focus:outline-none focus:border-primary' 
                                type="text" 
                                placeholder='Professional certifications' 
                                required 
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label className='text-sm font-medium text-gray-700'>Base Price</label>
                            <input 
                                onChange={e => setPrice(e.target.value)} 
                                value={price} 
                                className='border rounded-md px-3 py-2 focus:outline-none focus:border-primary' 
                                type="number" 
                                placeholder='Starting price for services' 
                                required 
                            />
                        </div>

                        {/* <div className='flex-1 flex flex-col gap-1'>
                            <label className='text-sm font-medium text-gray-700'>Instagram Handle</label>
                            <input 
                                onChange={e => setInstagram(e.target.value)} 
                                value={instagram} 
                                className='border rounded-md px-3 py-2 focus:outline-none focus:border-primary' 
                                type="text" 
                                placeholder='@username (optional)' 
                            />
                        </div> 

                        <div className='flex-1 flex flex-col gap-1'>
                            <label className='text-sm font-medium text-gray-700'>Working Hours</label>
                            <input 
                                onChange={e => setWorkingHours(e.target.value)} 
                                value={workingHours} 
                                className='border rounded-md px-3 py-2 focus:outline-none focus:border-primary' 
                                type="text" 
                                placeholder='e.g. Tue-Sat: 10AM-7PM' 
                                required 
                            />
                        </div>*/}
                    </div>
                </div>

                <div>
                    <label className='text-sm font-medium text-gray-700 block mt-6 mb-2'>About The Stylist</label>
                    <textarea 
                        onChange={e => setAbout(e.target.value)} 
                        value={about} 
                        className='w-full px-4 pt-3 border rounded-md focus:outline-none focus:border-primary' 
                        rows={4} 
                        placeholder="Describe the stylist's expertise, style philosophy, and approach to client service"
                        required
                    ></textarea>
                </div>

                <div className='flex justify-end mt-6'>
                    <button 
                        type='submit' 
                        className='bg-primary px-8 py-3 text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2'
                    >
                        Add Stylist
                    </button>
                </div>
            </div>
        </form>
    )
}

export default AddStylist;
