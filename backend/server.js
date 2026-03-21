import express from "express";
import cors from "cors";
import "dotenv/config";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

// ✅ FIXED: Changed from require() to import
import passport from "./config/passport.js";
import authRouter from "./routes/authRoutes.js";

import {
    startAppointmentCompletionCron,
    completePastAppointments,
} from "./utils/appointmentCron.js";

// 🔥 APP CONFIG
const app = express();
const port = process.env.PORT || 4000;

// 🔥 CONNECT DATABASE
connectDB().then(async() => {
    console.log("✅ Database connected successfully");
    await completePastAppointments();
    startAppointmentCompletionCron();
});

// 🔥 CONNECT CLOUDINARY
connectCloudinary();

// 🔥 DEBUG ENV (REMOVE AFTER TESTING)
console.log("TWILIO SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TWILIO TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "Loaded ✅" : "Missing ❌");
console.log("TWILIO PHONE:", process.env.TWILIO_PHONE_NUMBER);

// 🔥 SWAGGER SETUP
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Doctor Booking API",
            version: "1.0.0",
            description: "API documentation for Doctor Booking Application",
        },
        servers: [{
            url: process.env.NODE_ENV === "production" ?
                process.env.BACKEND_URL :
                `http://localhost:${port}`,
        }, ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./routes/*.js", "./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// 🔥 MIDDLEWARES
app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://salon-booking-frontend-nu.vercel.app",
    "https://salon-booking-admin.vercel.app",
];

app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                return callback(new Error("CORS blocked ❌"), false);
            }
            return callback(null, true);
        },
        credentials: true,
    })
);

app.set("trust proxy", 1);

// ✅ Passport middleware — must be AFTER express.json() and cors
app.use(passport.initialize());

// 🔥 SWAGGER ROUTE
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 🔥 API ROUTES
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

// ✅ Auth routes (Google OAuth + Forgot Password OTP)
app.use("/api/auth", authRouter);

// 🔥 HEALTH CHECK
app.get("/", (req, res) => {
    res.send("API Working");
});

// 🔥 START SERVER
app.listen(port, () => {
    console.log(`🚀 Server started on PORT: ${port}`);
});