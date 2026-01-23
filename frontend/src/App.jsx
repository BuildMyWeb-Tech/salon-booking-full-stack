// App.jsx
import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Verify from './pages/Verify'
import Services from './pages/Services'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { X, Download } from 'lucide-react'

const App = () => {
  const location = useLocation()

  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallModal, setShowInstallModal] = useState(false)

  let popupTimer = null
  let popupInterval = null

  /* ================================
     CHECK IF APP IS ALREADY INSTALLED
  ================================= */
  const isPWAInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  /* ================================
     CAPTURE INSTALL PROMPT
  ================================= */
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  /* ================================
     POPUP DISPLAY LOGIC
  ================================= */
  useEffect(() => {
    if (location.pathname === '/login') return
    if (isPWAInstalled) return
    if (localStorage.getItem('app_installed') === 'true') return

    const laterClicked = localStorage.getItem('install_later')

    // FIRST TIME VISIT → 5 seconds
    if (!laterClicked) {
      popupTimer = setTimeout(() => {
        setShowInstallModal(true)
      }, 5000)
    }

    // "Maybe Later" → every 1 minute
    if (laterClicked === 'true') {
      popupInterval = setInterval(() => {
        setShowInstallModal(true)
      }, 60000)
    }

    return () => {
      clearTimeout(popupTimer)
      clearInterval(popupInterval)
    }
  }, [location])

  /* ================================
     ESC KEY CLOSE
  ================================= */
  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === 'Escape') setShowInstallModal(false)
    }

    document.addEventListener('keydown', escHandler)
    return () => document.removeEventListener('keydown', escHandler)
  }, [])

  /* ================================
     INSTALL APP
  ================================= */
  const installApp = async () => {
    if (!installPrompt) return

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice

    if (choice.outcome === 'accepted') {
      localStorage.setItem('app_installed', 'true')
    }

    setShowInstallModal(false)
    setInstallPrompt(null)
  }

  /* ================================
     MAYBE LATER
  ================================= */
  const handleMaybeLater = () => {
    localStorage.setItem('install_later', 'true')
    setShowInstallModal(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer position="top-center" autoClose={3000} />

      <Navbar />
      <ScrollToTop />

      {/* ===== INSTALL MODAL ===== */}
      {/* {showInstallModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-[90%] max-w-sm rounded-xl bg-white p-6 text-center shadow-xl animate-fadeIn">

            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Download size={26} />
            </div>

            <h2 className="text-xl font-semibold">Install StyleStudio App</h2>
            <p className="mt-2 text-sm text-gray-600">
              Book appointments faster with our app experience.
            </p>

            <button
              onClick={installApp}
              className="mt-5 w-full rounded-lg bg-primary py-3 text-white font-medium hover:bg-primary/90"
            >
              Install App
            </button>

            <button
              onClick={handleMaybeLater}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Maybe later
            </button>
          </div>
        </div>
      )} */}

      {/* ===== ROUTES ===== */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stylists" element={<Doctors />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
