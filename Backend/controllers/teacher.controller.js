import { pool } from "../config/db.js"
import { generateUUID, formatRow, formatRows, buildSetClause } from "../utils/index.js"

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/Admin
export const getTeachers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM teacher")

    res.status(200).json({
      success: true,
      count: rows.length,
      data: formatRows(rows),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacher = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    res.status(200).json({
      success: true,
      data: formatRow(rows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Teacher
export const updateTeacher = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this teacher",
      })
    }

    // Update teacher
    const { setClause, values } = buildSetClause(req.body)

    if (setClause) {
      await pool.query(`UPDATE teacher SET ${setClause} WHERE id = ?`, [...values, req.params.id])
    }

    // Get updated teacher
    const [updatedRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    res.status(200).json({
      success: true,
      data: formatRow(updatedRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get teacher's labs
// @route   GET /api/teachers/:id/labs
// @access  Private/Teacher
export const getTeacherLabs = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this teacher's labs",
      })
    }

    // Get teacher's labs
    const [labRows] = await pool.query("SELECT * FROM lab WHERE teacher_id = ?", [req.params.id])

    // Get timetables, enrollments, practicals, and notices for each lab
    const labs = await Promise.all(
      labRows.map(async (lab) => {
        const [timetableRows] = await pool.query("SELECT * FROM timetable WHERE lab_id = ?", [lab.id])

        const [enrollmentRows] = await pool.query(
          `
        SELECT e.*, s.name as student_name, s.roll_no as student_roll_no
        FROM enrollment e
        JOIN student s ON e.student_id = s.id
        WHERE e.lab_id = ?
      `,
          [lab.id],
        )

        const [practicalRows] = await pool.query("SELECT * FROM practical WHERE lab_id = ?", [lab.id])

        const [noticeRows] = await pool.query("SELECT * FROM notice WHERE lab_id = ?", [lab.id])

        return {
          ...formatRow(lab),
          timetables: formatRows(timetableRows),
          enrollments: enrollmentRows.map((enrollment) => ({
            ...formatRow(enrollment),
            student: {
              id: enrollment.student_id,
              name: enrollment.student_name,
              rollNo: enrollment.student_roll_no,
            },
          })),
          practicals: formatRows(practicalRows),
          notices: formatRows(noticeRows),
        }
      }),
    )

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

// @desc    Create lab
// @route   POST /api/teachers/:id/labs
// @access  Private/Teacher
export const createLab = async (req, res) => {
  try {
    const { subjectName, subjectCode, syllabus, attendanceMarks, practicalMarks, vivaMarks } = req.body

    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create lab for this teacher",
      })
    }

    // Check if lab with subject code already exists
    const [existingLabRows] = await pool.query("SELECT * FROM lab WHERE subject_code = ?", [subjectCode])

    if (existingLabRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Lab with this subject code already exists",
      })
    }

    // Create lab
    const labId = generateUUID()
    await pool.query(
      "INSERT INTO lab (id, subject_name, subject_code, syllabus, attendance_marks, practical_marks, viva_marks, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        labId,
        subjectName,
        subjectCode,
        syllabus,
        attendanceMarks || 10,
        practicalMarks || 60,
        vivaMarks || 30,
        req.params.id,
      ],
    )

    // Get created lab
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [labId])

    res.status(201).json({
      success: true,
      data: formatRow(labRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update lab
// @route   PUT /api/teachers/:id/labs/:labId
// @access  Private/Teacher
export const updateLab = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if lab exists
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.labId])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    // Check if teacher owns the lab
    if (labRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this lab",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update lab for this teacher",
      })
    }

    // Update lab
    const { setClause, values } = buildSetClause(req.body)

    if (setClause) {
      await pool.query(`UPDATE lab SET ${setClause} WHERE id = ?`, [...values, req.params.labId])
    }

    // Get updated lab
    const [updatedRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.labId])

    res.status(200).json({
      success: true,
      data: formatRow(updatedRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete lab
// @route   DELETE /api/teachers/:id/labs/:labId
// @access  Private/Teacher
export const deleteLab = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if lab exists
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.labId])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    // Check if teacher owns the lab
    if (labRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this lab",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete lab for this teacher",
      })
    }

    // Delete lab
    await pool.query("DELETE FROM lab WHERE id = ?", [req.params.labId])

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create timetable entry
// @route   POST /api/teachers/:id/labs/:labId/timetable
// @access  Private/Teacher
export const createTimetable = async (req, res) => {
  try {
    const { day, startTime, endTime, room } = req.body

    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if lab exists
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.labId])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    // Check if teacher owns the lab
    if (labRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create timetable for this lab",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create timetable for this teacher",
      })
    }

    // Create timetable entry
    const timetableId = generateUUID()
    await pool.query("INSERT INTO timetable (id, day, start_time, end_time, room, lab_id) VALUES (?, ?, ?, ?, ?, ?)", [
      timetableId,
      day,
      startTime,
      endTime,
      room,
      req.params.labId,
    ])

    // Get created timetable
    const [timetableRows] = await pool.query("SELECT * FROM timetable WHERE id = ?", [timetableId])

    res.status(201).json({
      success: true,
      data: formatRow(timetableRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update timetable entry
// @route   PUT /api/teachers/:id/timetable/:timetableId
// @access  Private/Teacher
export const updateTimetable = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if timetable exists
    const [timetableRows] = await pool.query(
      "SELECT t.*, l.teacher_id FROM timetable t JOIN lab l ON t.lab_id = l.id WHERE t.id = ?",
      [req.params.timetableId],
    )

    if (timetableRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      })
    }

    // Check if teacher owns the lab
    if (timetableRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this timetable",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update timetable for this teacher",
      })
    }

    // Update timetable
    const { setClause, values } = buildSetClause(req.body)

    if (setClause) {
      await pool.query(`UPDATE timetable SET ${setClause} WHERE id = ?`, [...values, req.params.timetableId])
    }

    // Get updated timetable
    const [updatedRows] = await pool.query("SELECT * FROM timetable WHERE id = ?", [req.params.timetableId])

    res.status(200).json({
      success: true,
      data: formatRow(updatedRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete timetable entry
// @route   DELETE /api/teachers/:id/timetable/:timetableId
// @access  Private/Teacher
export const deleteTimetable = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if timetable exists
    const [timetableRows] = await pool.query(
      "SELECT t.*, l.teacher_id FROM timetable t JOIN lab l ON t.lab_id = l.id WHERE t.id = ?",
      [req.params.timetableId],
    )

    if (timetableRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      })
    }

    // Check if teacher owns the lab
    if (timetableRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this timetable",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete timetable for this teacher",
      })
    }

    // Delete timetable
    await pool.query("DELETE FROM timetable WHERE id = ?", [req.params.timetableId])

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create practical
// @route   POST /api/teachers/:id/labs/:labId/practicals
// @access  Private/Teacher
export const createPractical = async (req, res) => {
  try {
    const { title, description, deadline } = req.body

    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if lab exists
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.labId])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    // Check if teacher owns the lab
    if (labRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create practical for this lab",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create practical for this teacher",
      })
    }

    // Create practical
    const practicalId = generateUUID()
    await pool.query(
      "INSERT INTO practical (id, title, description, deadline, lab_id, teacher_id) VALUES (?, ?, ?, ?, ?, ?)",
      [practicalId, title, description, new Date(deadline), req.params.labId, req.params.id],
    )

    // Get created practical
    const [practicalRows] = await pool.query("SELECT * FROM practical WHERE id = ?", [practicalId])

    res.status(201).json({
      success: true,
      data: formatRow(practicalRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update practical
// @route   PUT /api/teachers/:id/practicals/:practicalId
// @access  Private/Teacher
export const updatePractical = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if practical exists
    const [practicalRows] = await pool.query("SELECT * FROM practical WHERE id = ?", [req.params.practicalId])

    if (practicalRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Practical not found",
      })
    }

    // Check if teacher owns the practical
    if (practicalRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this practical",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update practical for this teacher",
      })
    }

    // Update practical
    const { setClause, values } = buildSetClause(req.body)

    if (setClause) {
      await pool.query(`UPDATE practical SET ${setClause} WHERE id = ?`, [...values, req.params.practicalId])
    }

    // Get updated practical
    const [updatedRows] = await pool.query("SELECT * FROM practical WHERE id = ?", [req.params.practicalId])

    res.status(200).json({
      success: true,
      data: formatRow(updatedRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete practical
// @route   DELETE /api/teachers/:id/practicals/:practicalId
// @access  Private/Teacher
export const deletePractical = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if practical exists
    const [practicalRows] = await pool.query("SELECT * FROM practical WHERE id = ?", [req.params.practicalId])

    if (practicalRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Practical not found",
      })
    }

    // Check if teacher owns the practical
    if (practicalRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this practical",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete practical for this teacher",
      })
    }

    // Delete practical
    await pool.query("DELETE FROM practical WHERE id = ?", [req.params.practicalId])

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Mark attendance
// @route   POST /api/teachers/:id/labs/:labId/attendance
// @access  Private/Teacher
export const markAttendance = async (req, res) => {
  try {
    const { studentId, date, isPresent } = req.body

    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if lab exists
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.labId])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    // Check if teacher owns the lab
    if (labRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to mark attendance for this lab",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to mark attendance for this teacher",
      })
    }

    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM student WHERE id = ?", [studentId])

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if student is enrolled in the lab
    const [enrollmentRows] = await pool.query("SELECT * FROM enrollment WHERE student_id = ? AND lab_id = ?", [
      studentId,
      req.params.labId,
    ])

    if (enrollmentRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student not enrolled in this lab",
      })
    }

    // Create or update attendance
    const attendanceDate = new Date(date)
    const formattedDate = attendanceDate.toISOString().split("T")[0] // Format as YYYY-MM-DD

    // Check if attendance record already exists
    const [existingAttendanceRows] = await pool.query(
      "SELECT * FROM attendance WHERE student_id = ? AND lab_id = ? AND date = ?",
      [studentId, req.params.labId, formattedDate],
    )

    let attendanceId

    if (existingAttendanceRows.length > 0) {
      attendanceId = existingAttendanceRows[0].id
      await pool.query("UPDATE attendance SET is_present = ?, updated_at = NOW() WHERE id = ?", [
        isPresent,
        attendanceId,
      ])
    } else {
      attendanceId = generateUUID()
      await pool.query("INSERT INTO attendance (id, date, is_present, student_id, lab_id) VALUES (?, ?, ?, ?, ?)", [
        attendanceId,
        formattedDate,
        isPresent,
        studentId,
        req.params.labId,
      ])
    }

    // Get updated attendance
    const [attendanceRows] = await pool.query("SELECT * FROM attendance WHERE id = ?", [attendanceId])

    res.status(201).json({
      success: true,
      data: formatRow(attendanceRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create notice
// @route   POST /api/teachers/:id/labs/:labId/notices
// @access  Private/Teacher
export const createNotice = async (req, res) => {
  try {
    const { title, content } = req.body

    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if lab exists
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.labId])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    // Check if teacher owns the lab
    if (labRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create notice for this lab",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create notice for this teacher",
      })
    }

    // Create notice
    const noticeId = generateUUID()
    await pool.query("INSERT INTO notice (id, title, content, teacher_id, lab_id) VALUES (?, ?, ?, ?, ?)", [
      noticeId,
      title,
      content,
      req.params.id,
      req.params.labId,
    ])

    // Get created notice
    const [noticeRows] = await pool.query("SELECT * FROM notice WHERE id = ?", [noticeId])

    res.status(201).json({
      success: true,
      data: formatRow(noticeRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update notice
// @route   PUT /api/teachers/:id/notices/:noticeId
// @access  Private/Teacher
export const updateNotice = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if notice exists
    const [noticeRows] = await pool.query("SELECT * FROM notice WHERE id = ?", [req.params.noticeId])

    if (noticeRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      })
    }

    // Check if teacher owns the notice
    if (noticeRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this notice",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update notice for this teacher",
      })
    }

    // Update notice
    const { setClause, values } = buildSetClause(req.body)

    if (setClause) {
      await pool.query(`UPDATE notice SET ${setClause} WHERE id = ?`, [...values, req.params.noticeId])
    }

    // Get updated notice
    const [updatedRows] = await pool.query("SELECT * FROM notice WHERE id = ?", [req.params.noticeId])

    res.status(200).json({
      success: true,
      data: formatRow(updatedRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete notice
// @route   DELETE /api/teachers/:id/notices/:noticeId
// @access  Private/Teacher
export const deleteNotice = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if notice exists
    const [noticeRows] = await pool.query("SELECT * FROM notice WHERE id = ?", [req.params.noticeId])

    if (noticeRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      })
    }

    // Check if teacher owns the notice
    if (noticeRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notice",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete notice for this teacher",
      })
    }

    // Delete notice
    await pool.query("DELETE FROM notice WHERE id = ?", [req.params.noticeId])

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Grade submission
// @route   POST /api/teachers/:id/submissions/:submissionId/grade
// @access  Private/Teacher
export const gradeSubmission = async (req, res) => {
  try {
    const { practicalMark, vivaMark } = req.body

    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if submission exists
    const [submissionRows] = await pool.query(
      `
      SELECT s.*, p.lab_id, p.id as practical_id, l.teacher_id, s.student_id
      FROM submission s
      JOIN practical p ON s.practical_id = p.id
      JOIN lab l ON p.lab_id = l.id
      WHERE s.id = ?
    `,
      [req.params.submissionId],
    )

    if (submissionRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    const submission = formatRow(submissionRows[0])

    // Check if teacher owns the lab
    if (submission.teacherId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to grade this submission",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to grade submission for this teacher",
      })
    }

    // Get lab details
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [submission.labId])

    const lab = formatRow(labRows[0])

    // Get student's attendance for this lab
    const [attendanceRows] = await pool.query("SELECT * FROM attendance WHERE student_id = ? AND lab_id = ?", [
      submission.studentId,
      submission.labId,
    ])

    // Calculate attendance percentage
    const totalClasses = attendanceRows.length
    const presentClasses = attendanceRows.filter((a) => a.is_present).length
    const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

    // Calculate attendance marks based on percentage
    const attendanceMark = (attendancePercentage / 100) * lab.attendanceMarks

    // Calculate total mark
    const totalMark = attendanceMark + practicalMark + vivaMark

    // Check if mark already exists
    const [existingMarkRows] = await pool.query("SELECT * FROM mark WHERE submission_id = ?", [req.params.submissionId])

    let markId

    // Create or update mark
    if (existingMarkRows.length > 0) {
      markId = existingMarkRows[0].id
      await pool.query(
        "UPDATE mark SET attendance_mark = ?, practical_mark = ?, viva_mark = ?, total_mark = ?, updated_at = NOW() WHERE id = ?",
        [attendanceMark, practicalMark, vivaMark, totalMark, markId],
      )
    } else {
      markId = generateUUID()
      await pool.query(
        "INSERT INTO mark (id, attendance_mark, practical_mark, viva_mark, total_mark, student_id, submission_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [markId, attendanceMark, practicalMark, vivaMark, totalMark, submission.studentId, req.params.submissionId],
      )
    }

    // Get updated mark
    const [markRows] = await pool.query("SELECT * FROM mark WHERE id = ?", [markId])

    res.status(201).json({
      success: true,
      data: formatRow(markRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get lab students
// @route   GET /api/teachers/:id/labs/:labId/students
// @access  Private/Teacher
export const getLabStudents = async (req, res) => {
  try {
    // Check if teacher exists
    const [teacherRows] = await pool.query("SELECT * FROM teacher WHERE id = ?", [req.params.id])

    if (teacherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    // Check if lab exists
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.labId])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    // Check if teacher owns the lab
    if (labRows[0].teacher_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view students for this lab",
      })
    }

    // Check if user is the teacher
    if (req.user.role === "TEACHER" && req.user.teacher.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view students for this teacher",
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
      [req.params.labId],
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
