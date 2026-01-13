import mongoose from "mongoose";

const stylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    specialty: { type: String, required: true },
    certification: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    price: { type: Number, required: true },
    instagram: { type: String, default: "" },
    workingHours: { type: String, default: "10AM-7PM" },
    slots_booked: { type: Object, default: {} },
    date: { type: Number, required: true },
}, { minimize: false })

const stylistModel = mongoose.models.stylist || mongoose.model("stylist", stylistSchema);
export default stylistModel;
