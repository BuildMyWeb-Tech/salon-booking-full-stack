import express from "express"
import cors from 'cors'
import 'dotenv/config'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Doctor Booking API',
      version: '1.0.0',
      description: 'API documentation for Doctor Booking Application',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
    },
   servers: [
  {
    url:
      process.env.NODE_ENV === "production"
        ? process.env.BACKEND_URL
        : `http://localhost:${port}`,
    description:
      process.env.NODE_ENV === "production"
        ? "Production server"
        : "Development server",
  },
],


    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js', './server.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// middlewares
app.use(express.json())
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://salon-booking.vercel.app",
    "https://salon-admin.vercel.app"
  ],
  credentials: true
}));

app.set("trust proxy", 1);
// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)

/**
 * @swagger
 * /:
 *   get:
 *     summary: Check if API is working
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is working
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "API Working"
 */
app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))