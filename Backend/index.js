import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { testConnection } from "./config/db.js"
import initDatabase from "./db/init.js"
import authRoutes from "./routes/auth.routes.js"
import studentRoutes from "./routes/student.routes.js"
import teacherRoutes from "./routes/teacher.routes.js"
import labRoutes from "./routes/lab.routes.js"
import { errorHandler } from "./middleware/error.middleware.js"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Test database connection and initialize if needed
;(async () => {
  const isConnected = await testConnection()
  if (isConnected) {
    if (process.env.INIT_DB === "true") {
      await initDatabase()
    }
  } else {
    console.error("Unable to connect to the database. Please check your configuration.")
    process.exit(1)
  }
})()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/teachers", teacherRoutes)
app.use("/api/labs", labRoutes)

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...")
  console.log(err.name, err.message)
  process.exit(1)
})
