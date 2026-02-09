import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (aToken) {
            getAllAppointments();
        }
    }, [aToken]);

    // Getting all Doctors data from Database using API
    const getAllDoctors = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                backendUrl + '/api/admin/all-doctors', 
                { headers: { aToken } }
            );
            
            if (data.success) {
                setDoctors(data.doctors);
                return data.doctors;
            } else {
                toast.error(data.message);
                return [];
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch stylists");
            console.error("Error fetching stylists:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Function to get a single doctor/stylist by ID
    const getDoctorById = async (id) => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/admin/doctor/${id}`,
                { headers: { aToken } }
            );
            
            if (data.success) {
                // Normalize data to ensure consistent field names
                const stylist = data.stylist;
                
                // Ensure specialty is always an array
                if (stylist.speciality && !stylist.specialty) {
                    stylist.specialty = Array.isArray(stylist.speciality) ? 
                        stylist.speciality : [stylist.speciality];
                } else if (stylist.specialty && !Array.isArray(stylist.specialty)) {
                    stylist.specialty = [stylist.specialty];
                }

                // Ensure phone field is consistent
                if (stylist.phoneNumber && !stylist.phone) {
                    stylist.phone = stylist.phoneNumber;
                }
                
                // Ensure price field is consistent
                if (stylist.fees && !stylist.price) {
                    stylist.price = stylist.fees;
                }
                
                return stylist;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch stylist details";
            toast.error(errorMsg);
            console.error("Error fetching stylist:", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Function to update a doctor/stylist
    const updateDoctor = async (id, formData) => {
        setLoading(true);
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
                toast.success(data.message || "Stylist updated successfully");
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
            const errorMsg = error.response?.data?.message || error.message || "Failed to update stylist";
            toast.error(errorMsg);
            console.error("Error updating stylist:", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Function to delete a doctor/stylist
    const deleteDoctor = async (id) => {
        setLoading(true);
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
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Function to change doctor availability using API
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
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || "Failed to update availability");
            return false;
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
                return [];
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error("Failed to load appointments: " + (error.response?.data?.message || error.message || "Unknown error"));
            return [];
        } finally {
            setAppointmentsLoading(false);
        }
    };

    // Function to cancel appointment using API
    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/cancel-appointment', 
                { appointmentId }, 
                { headers: { aToken } }
            );

            if (data.success) {
                toast.success(data.message);
                await getAllAppointments();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to cancel appointment");
            console.error("Error cancelling appointment:", error);
            return false;
        }
    };

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
                return true;
            } else {
                toast.error(data.message || "Failed to update appointment");
                return false;
            }
        } catch (error) {
            console.error("Error marking appointment complete:", error);
            toast.error("Failed to update: " + (error.response?.data?.message || error.message || "Unknown error"));
            return false;
        }
    };
    
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
                return true;
            } else {
                toast.error(data.message || "Failed to update appointment");
                return false;
            }
        } catch (error) {
            console.error("Error marking appointment incomplete:", error);
            toast.error("Failed to update: " + (error.response?.data?.message || error.message || "Unknown error"));
            return false;
        }
    };

    // Getting Admin Dashboard data from Database using API
    const getDashData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                backendUrl + '/api/admin/dashboard', 
                { headers: { aToken } }
            );

            if (data.success) {
                console.log('Dashboard data received:', data.dashData); // Debug log
                setDashData(data.dashData);
                return data.dashData;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to load dashboard data");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        aToken, 
        setAToken,
        doctors,
        loading,
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
    );
};

export default AdminContextProvider;
