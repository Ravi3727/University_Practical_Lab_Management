import jwt from "jsonwebtoken"
import { pool } from "../config/db.js"
import { formatRow } from "../utils/index.js"

export const protect = async (req, res, next) => {
  try {
    let token

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // console.log("Token:", token)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from token
    const [userRows] = await pool.query("SELECT * FROM user WHERE id = ?", [decoded.id])

    if (userRows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    const user = formatRow(userRows[0])

    // Get additional user details based on role
    if (user.role === "STUDENT") {
      const [studentRows] = await pool.query("SELECT * FROM student WHERE user_id = ?", [user.id])
      if (studentRows.length > 0) {
        user.student = formatRow(studentRows[0])
      }
    } else if (user.role === "TEACHER") {
      const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE user_id = ?", [user.id])
      if (teacherRows.length > 0) {
        user.teacher = formatRow(teacherRows[0])
      }
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      })
    }
    next()
  }
}
