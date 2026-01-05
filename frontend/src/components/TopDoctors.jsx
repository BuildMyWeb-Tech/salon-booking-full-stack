import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {
    const navigate = useNavigate()
    const { doctors: stylists } = useContext(AppContext)

    return (
        <section className='w-full py-16 px-4 sm:px-6 md:px-8 bg-gray-50'>
            <div className='container mx-auto'>
                <div className='text-center max-w-3xl mx-auto mb-12'>
                    <h2 className='text-3xl sm:text-4xl font-bold text-gray-800 mb-4'>Featured Stylists</h2>
                    
                    <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
                    
                    <p className='text-gray-600'>
                        Meet our award-winning team of creative professionals ready to transform your look with expertise and passion.
                    </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'>
                    {stylists.slice(0, 8).map((stylist, index) => (
                        <div 
                            key={index}
                            onClick={() => { 
                                navigate(`/appointment/${stylist._id}`); 
                                scrollTo(0, 0); 
                            }} 
                            className='bg-white rounded-xl overflow-hidden shadow hover:shadow-md border border-gray-100 cursor-pointer transform hover:-translate-y-2 transition-all duration-500'
                        >
                            <div className='relative overflow-hidden h-64'>
                                <img 
                                    className='w-full h-full object-cover' 
                                    src={stylist.image} 
                                    alt={stylist.name} 
                                />
                            </div>
                            
                            <div className='p-5'>
                                <div className='flex justify-between items-center mb-3'>
                                    <h3 className='text-lg font-semibold text-gray-800'>{stylist.name}</h3>
                                    
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${stylist.available 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {stylist.available ? 'Available' : 'Booked'}
                                    </div>
                                </div>
                                
                                <p className='text-sm text-primary font-medium mb-3'>{stylist.speciality}</p>
                                
                                <div className='flex items-center mb-4'>
                                    {[...Array(5)].map((_, i) => (
                                        <svg 
                                            key={i} 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className={`h-4 w-4 ${i < (stylist.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}
                                            viewBox="0 0 20 20" 
                                            fill="currentColor"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className='ml-2 text-xs text-gray-500'>
                                        ({stylist.reviews || '28'} reviews)
                                    </span>
                                </div>
                                
                                <button className='w-full py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium'>
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className='flex justify-center mt-12'>
                    <button 
                        onClick={() => { 
                            navigate('/stylists'); 
                            scrollTo(0, 0);
                        }} 
                        className='bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors px-10 py-3 rounded-full font-medium flex items-center gap-2'
                    >
                        View All Stylists
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    )
}

export default TopDoctors
