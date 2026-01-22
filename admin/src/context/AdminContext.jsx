import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')

    const [appointments, setAppointments] = useState([])
    const [appointmentsLoading, setAppointmentsLoading] = useState(false) // Add this
    const [doctors, setDoctors] = useState([])
    const [dashData, setDashData] = useState(false)

    // Getting all Doctors data from Database using API
    const getAllDoctors = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    // Function to change doctor availablity using API
    const changeAvailability = async (docId) => {
        try {

            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


 // Getting all appointment data from Database using API
     const getAllAppointments = async () => {
         setAppointmentsLoading(true);
         try {
             console.log("Fetching appointments with token:", aToken);
             const { data } = await axios.get(
                 backendUrl + "/api/admin/appointments",
                 { headers: { aToken } } // Make sure you're using the correct header name
             );
             
             if (data.success) {
                 console.log("Appointments fetched successfully:", data.appointments.length);
                 setAppointments(data.appointments);
             } else {
                 console.error("API returned error:", data.message);
                 toast.error(data.message);
             }
         } catch (error) {
             console.error("Error fetching appointments:", error.message);
             if (error.response) {
                 console.error("Response status:", error.response.status);
                 console.error("Response data:", error.response.data);
             }
             toast.error("Failed to load appointments: " + (error.message || "Unknown error"));
         } finally {
             setAppointmentsLoading(false);
         }
     }

    // Function to cancel appointment using API
    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Functions for marking appointments complete/incomplete
        const markAppointmentCompleted = async (id) => {
            try {
                const { data } = await axios.post(
                    backendUrl + '/api/admin/mark-appointment-completed', 
                    { appointmentId: id }, 
                    { headers: { aToken } }
                );
                
                if (data.success) {
                    toast.success(data.message || "Appointment marked as completed");
                    // Update locally to avoid needing a full refresh
                    setAppointments(prev => 
                        prev.map(app => app._id === id ? {...app, isCompleted: true} : app)
                    );
                } else {
                    toast.error(data.message || "Failed to update appointment");
                }
            } catch (error) {
                console.error("Error marking appointment complete:", error);
                toast.error("Failed to update: " + (error.message || "Unknown error"));
            }
        }
        
        const markAppointmentIncomplete = async (id) => {
            try {
                const { data } = await axios.post(
                    backendUrl + '/api/admin/mark-appointment-incomplete', 
                    { appointmentId: id }, 
                    { headers: { aToken } }
                );
                
                if (data.success) {
                    toast.success(data.message || "Appointment marked as incomplete");
                    // Update locally to avoid needing a full refresh
                    setAppointments(prev => 
                        prev.map(app => app._id === id ? {...app, isCompleted: false} : app)
                    );
                } else {
                    toast.error(data.message || "Failed to update appointment");
                }
            } catch (error) {
                console.error("Error marking appointment incomplete:", error);
                toast.error("Failed to update: " + (error.message || "Unknown error"));
            }
        }

    // Getting Admin Dashboard data from Database using API
    const getDashData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const value = {
        aToken, setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        appointmentsLoading,  // Add this
        getAllAppointments,
        getDashData,
        cancelAppointment,
        markAppointmentCompleted,  // Add these
        markAppointmentIncomplete,
        dashData
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider