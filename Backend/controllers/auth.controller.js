import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "../config/db.js"
import { generateUUID, formatRow } from "../utils/index.js"

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { email, password, role, name, rollNo, phoneNumber, branchName, semester, department } = req.body

    // Check if user exists
    const [existingUsers] = await connection.query("SELECT * FROM user WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const userId = generateUUID()
    await connection.query("INSERT INTO user (id, email, password, role) VALUES (?, ?, ?, ?)", [
      userId,
      email,
      hashedPassword,
      role,
    ])

    const userData = { id: userId, email, role }

    // Create student or teacher based on role
    if (role === "STUDENT") {
      const studentId = generateUUID()
      await connection.query(
        "INSERT INTO student (id, name, roll_no, phone_number, branch_name, semester, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [studentId, name, rollNo, phoneNumber, branchName, semester, userId],
      )

      const [studentRows] = await connection.query("SELECT * FROM student WHERE id = ?", [studentId])

      userData.student = formatRow(studentRows[0])
    } else if (role === "TEACHER") {
      const teacherId = generateUUID()
      await connection.query("INSERT INTO teacher (id, name, department, user_id) VALUES (?, ?, ?, ?)", [
        teacherId,
        name,
        department,
        userId,
      ])

      const [teacherRows] = await connection.query("SELECT * FROM teacher WHERE id = ?", [teacherId])

      userData.teacher = formatRow(teacherRows[0])
    }

    await connection.commit()

    // Generate token
    const token = generateToken(userId)

    res.status(201).json({
      success: true,
      token,
      user: userData,
    })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({
      success: false,
      message: error.message,
    })
  } finally {
    connection.release()
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const [userRows] = await pool.query("SELECT * FROM user WHERE email = ?", [email])

    if (userRows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const user = formatRow(userRows[0])

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Get additional user details based on role
    const userData = { id: user.id, email: user.email, role: user.role }

    if (user.role === "STUDENT") {
      const [studentRows] = await pool.query("SELECT * FROM student WHERE user_id = ?", [user.id])
      if (studentRows.length > 0) {
        userData.student = formatRow(studentRows[0])
      }
    } else if (user.role === "TEACHER") {
      const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE user_id = ?", [user.id])
      if (teacherRows.length > 0) {
        userData.teacher = formatRow(teacherRows[0])
      }
    }

    // Generate token
    const token = generateToken(user.id)

    res.status(200).json({
      success: true,
      token,
      user: userData,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        ...(req.user.student && { student: req.user.student }),
        ...(req.user.teacher && { teacher: req.user.teacher }),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
