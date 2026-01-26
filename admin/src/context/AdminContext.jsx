import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import { useEffect } from 'react';


export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')
    const [appointmentsData, setAppointmentsData] = useState([]);

    const [appointments, setAppointments] = useState([])
    const [appointmentsLoading, setAppointmentsLoading] = useState(false) // Add this
    const [doctors, setDoctors] = useState([])
    const [dashData, setDashData] = useState(false)

     // Use effect to fetch appointments when token changes
useEffect(() => {
  if (aToken) {
    getAllAppointments();
  }
}, [aToken]);

     // Getting all Doctors data from Database using API
        const getAllDoctors = async () => {
            try {
                const { data } = await axios.get(
                    backendUrl + '/api/admin/all-doctors', 
                    { headers: { aToken } }
                );
                
                if (data.success) {
                    setDoctors(data.doctors);
                } else {
                    toast.error(data.message);
                }
    
                return data;
            } catch (error) {
                toast.error(error.message || "Failed to fetch stylists");
                console.error("Error fetching stylists:", error);
                throw error;
            }
        };
    
        // Function to get a single doctor/stylist by ID
        const getDoctorById = async (id) => {
            try {
                const { data } = await axios.get(
                    `${backendUrl}/api/admin/doctor/${id}`,
                    { headers: { aToken } }
                );
                
                if (data.success) {
                    return data.stylist;
                } else {
                    toast.error(data.message);
                    return null;
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "Failed to fetch stylist details");
                console.error("Error fetching stylist:", error);
                throw error;
            }
        };
    
        // Function to update a doctor/stylist
        const updateDoctor = async (id, formData) => {
            try {
                const { data } = await axios.put(
                    `${backendUrl}/api/admin/doctor/${id}`,
                    formData,
                    { 
                        headers: { 
                            aToken,
                            'Content-Type': 'multipart/form-data'
                        } 
                    }
                );
                
                if (data.success) {
                    toast.success(data.message);
                    // Update the doctors array to reflect changes
                    setDoctors(prevDoctors => 
                        prevDoctors.map(doc => 
                            doc._id === id ? data.stylist : doc
                        )
                    );
                    return data.stylist;
                } else {
                    toast.error(data.message);
                    return null;
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "Failed to update stylist");
                console.error("Error updating stylist:", error);
                throw error;
            }
        };

 
    
        // Function to delete a doctor/stylist
        const deleteDoctor = async (id) => {
            try {
                const { data } = await axios.delete(
                    `${backendUrl}/api/admin/doctor/${id}`,
                    { headers: { aToken } }
                );
                
                if (data.success) {
                    toast.success(data.message);
                    // Remove the deleted doctor from the doctors array
                    setDoctors(prevDoctors => 
                        prevDoctors.filter(doc => doc._id !== id)
                    );
                    return true;
                } else {
                    toast.error(data.message);
                    return false;
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Failed to delete stylist";
                toast.error(errorMsg);
                console.error("Error deleting stylist:", error);
                throw new Error(errorMsg);
            }
        };
    
        // Function to change doctor availablity using API
        const changeAvailability = async (docId) => {
            try {
                const { data } = await axios.post(
                    backendUrl + '/api/admin/change-availability', 
                    { docId }, 
                    { headers: { aToken } }
                );
                
                if (data.success) {
                    toast.success(data.message);
                    
                    // Update the doctors array locally
                    setDoctors(prevDoctors => 
                        prevDoctors.map(doc => 
                            doc._id === docId 
                                ? { ...doc, available: !doc.available } 
                                : doc
                        )
                    );
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error(error);
                toast.error(error.message || "Failed to update availability");
            }
        };


 // Getting all appointment data from Database using API
const getAllAppointments = async () => {
  setAppointmentsLoading(true);
  try {
    const { data } = await axios.get(
      backendUrl + "/api/admin/appointments",
      { headers: { aToken } }
    );
    
    if (data.success) {
      setAppointments(data.appointments);
      return data.appointments;
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Error fetching appointments:", error.message);
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
        aToken, 
        setAToken,
        doctors,
        getAllDoctors,
        getDoctorById,
        updateDoctor,
        deleteDoctor,
        changeAvailability,
        appointments,
        appointmentsLoading,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        markAppointmentCompleted,
        markAppointmentIncomplete,
        dashData
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider