// App.jsx
import React, { useEffect, useState, useRef } from 'react'
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

  const hasShownOnce = useRef(false)

  // ===== CAPTURE INSTALL PROMPT (ANDROID / DESKTOP) =====
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // ===== POPUP TIMERS =====
  useEffect(() => {
    if (location.pathname === '/login') return

    // FIRST TIME → 5 seconds
    const firstTimer = setTimeout(() => {
      setShowInstallModal(true)
      hasShownOnce.current = true
    }, 5000)

    // EVERY 1 MIN AFTER
    const intervalTimer = setInterval(() => {
      if (hasShownOnce.current) {
        setShowInstallModal(true)
      }
    }, 60000)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(intervalTimer)
    }
  }, [location.pathname])

  // ===== CLOSE WITH ESC =====
  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        setShowInstallModal(false)
      }
    }
    document.addEventListener('keydown', escHandler)
    return () => document.removeEventListener('keydown', escHandler)
  }, [])

  // ===== INSTALL BUTTON =====
  const installApp = async () => {
    if (!installPrompt) {
      alert('Use browser menu → "Add to Home Screen"')
      return
    }

    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
    setShowInstallModal(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer position="top-center" autoClose={3000} />

      <Navbar />
      <ScrollToTop />

      {/* ===== INSTALL POPUP (MOBILE + LAPTOP) ===== */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl animate-fadeIn relative">

            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-3 right-3 rounded-full p-1 text-gray-400 hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Download size={26} />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Install StyleStudio App
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Faster booking, easy access & smooth experience.
            </p>

            <button
              onClick={installApp}
              className="mt-5 w-full rounded-lg bg-primary py-3 text-white font-medium hover:bg-primary/90"
            >
              Install App
            </button>

            <button
              onClick={() => setShowInstallModal(false)}
              className="mt-3 w-full text-sm text-gray-500"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* ===== ROUTES ===== */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stylists" element={<Doctors />} />
          <Route path="/stylists/:speciality" element={<Doctors />} />
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
