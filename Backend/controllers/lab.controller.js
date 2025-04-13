import { pool } from "../config/db.js"
import { formatRow, formatRows } from "../utils/index.js"

// @desc    Get all labs
// @route   GET /api/labs
// @access  Public
export const getLabs = async (req, res) => {
  try {
    const [labRows] = await pool.query(`
      SELECT l.*, t.name as teacher_name, t.department as teacher_department
      FROM lab l
      JOIN teacher t ON l.teacher_id = t.id
    `)

    const labs = labRows.map((lab) => ({
      ...formatRow(lab),
      teacher: {
        id: lab.teacher_id,
        name: lab.teacher_name,
        department: lab.teacher_department,
      },
    }))

    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single lab
// @route   GET /api/labs/:id
// @access  Public
export const getLab = async (req, res) => {
  try {
    const [labRows] = await pool.query(
      `
      SELECT l.*, t.name as teacher_name, t.department as teacher_department
      FROM lab l
      JOIN teacher t ON l.teacher_id = t.id
      WHERE l.id = ?
    `,
      [req.params.id],
    )

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    const lab = labRows[0]

    // Get timetables
    const [timetableRows] = await pool.query("SELECT * FROM timetable WHERE lab_id = ?", [req.params.id])

    // Get practicals
    const [practicalRows] = await pool.query("SELECT * FROM practical WHERE lab_id = ? ORDER BY deadline ASC", [
      req.params.id,
    ])

    // Get notices
    const [noticeRows] = await pool.query("SELECT * FROM notice WHERE lab_id = ? ORDER BY created_at DESC", [
      req.params.id,
    ])

    const labData = {
      ...formatRow(lab),
      teacher: {
        id: lab.teacher_id,
        name: lab.teacher_name,
        department: lab.teacher_department,
      },
      timetables: formatRows(timetableRows),
      practicals: formatRows(practicalRows),
      notices: formatRows(noticeRows),
    }

    res.status(200).json({
      success: true,
      data: labData,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get lab timetable
// @route   GET /api/labs/:id/timetable
// @access  Public
export const getLabTimetable = async (req, res) => {
  try {
    const [timetableRows] = await pool.query("SELECT * FROM timetable WHERE lab_id = ? ORDER BY day ASC", [
      req.params.id,
    ])

    res.status(200).json({
      success: true,
      count: timetableRows.length,
      data: formatRows(timetableRows),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get lab practicals
// @route   GET /api/labs/:id/practicals
// @access  Public
export const getLabPracticals = async (req, res) => {
  try {
    const [practicalRows] = await pool.query("SELECT * FROM practical WHERE lab_id = ? ORDER BY deadline ASC", [
      req.params.id,
    ])

    res.status(200).json({
      success: true,
      count: practicalRows.length,
      data: formatRows(practicalRows),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get lab notices
// @route   GET /api/labs/:id/notices
// @access  Public
export const getLabNotices = async (req, res) => {
  try {
    const [noticeRows] = await pool.query(
      `
      SELECT n.*, t.name as teacher_name
      FROM notice n
      JOIN teacher t ON n.teacher_id = t.id
      WHERE n.lab_id = ?
      ORDER BY n.created_at DESC
    `,
      [req.params.id],
    )

    const notices = noticeRows.map((notice) => ({
      ...formatRow(notice),
      teacher: {
        id: notice.teacher_id,
        name: notice.teacher_name,
      },
    }))

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get lab students
// @route   GET /api/labs/:id/students
// @access  Private/Teacher
export const getLabStudents = async (req, res) => {
  try {
    // Check if lab exists
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.id])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    // Check if user is the teacher of this lab
    if (req.user.role === "TEACHER" && req.user.teacher.id !== labRows[0].teacher_id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view students for this lab",
      })
    }

    // Get lab students
    const [studentRows] = await pool.query(
      `
      SELECT s.*
      FROM student s
      JOIN enrollment e ON s.id = e.student_id
      WHERE e.lab_id = ?
    `,
      [req.params.id],
    )

    res.status(200).json({
      success: true,
      count: studentRows.length,
      data: formatRows(studentRows),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
