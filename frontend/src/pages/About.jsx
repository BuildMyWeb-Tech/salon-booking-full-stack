import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
  <div>
    <div className='text-center text-2xl pt-10 text-[#707070]'>
      <p>ABOUT <span className='text-gray-700 font-semibold'>US</span></p>
    </div>

    <div className='my-10 flex flex-col md:flex-row gap-12'>
      <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="Salon interior" />
      <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
        <p>Welcome to StyleStudio, where artistry meets expertise in creating the perfect look for every client. At StyleStudio, we believe that the right hairstyle can transform not just your appearance, but also how you feel about yourself.</p>
        <p>Our team of passionate stylists combines technical precision with creative vision, staying at the forefront of cutting-edge trends while mastering timeless techniques. Whether you're seeking a subtle refresh or a bold transformation, StyleStudio is dedicated to exceeding your expectations with every visit.</p>
        <b className='text-gray-800'>Our Philosophy</b>
        <p>At StyleStudio, we believe that beautiful hair should be accessible to everyone. We take time to understand your lifestyle, preferences, and hair type to create personalized styles that enhance your natural beauty and reflect your unique personality.</p>
      </div>
    </div>

    <div className='text-xl my-4'>
      <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>
    </div>

    <div className='flex flex-col md:flex-row mb-20'>
      <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
        <b>EXPERTISE:</b>
        <p>Our stylists receive continuous education to master the latest techniques and trends.</p>
      </div>
      <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
        <b>PERSONALIZED APPROACH:</b>
        <p>Detailed consultations ensure styles that complement your features and lifestyle.</p>
      </div>
      <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
        <b>PREMIUM PRODUCTS:</b>
        <p>We use only high-quality, professional products that protect and enhance your hair.</p>
      </div>
    </div>
  </div>

  )
}

export default About
