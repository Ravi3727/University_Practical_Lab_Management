import { pool } from "../config/db.js"
import { generateUUID, formatRow, formatRows, buildSetClause } from "../utils/index.js"

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Teacher
export const getStudents = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM student")

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

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudent = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
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

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Student
export const updateStudent = async (req, res) => {
  try {
    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if user is the student
    if (req.user.role === "STUDENT" && req.user.student.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this student",
      })
    }

    // Update student
    const { setClause, values } = buildSetClause(req.body)

    if (setClause) {
      await pool.query(`UPDATE student SET ${setClause} WHERE id = ?`, [...values, req.params.id])
    }

    // Get updated student
    const [updatedRows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

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

// @desc    Enroll student in lab
// @route   POST /api/students/:id/enroll
// @access  Private/Student
export const enrollInLab = async (req, res) => {
  try {
    const { labId } = req.body

    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if user is the student
    if (req.user.role === "STUDENT" && req.user.student.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to enroll this student",
      })
    }

    // Check if lab exists
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [labId])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    // Check if already enrolled
    const [enrollmentRows] = await pool.query("SELECT * FROM enrollment WHERE student_id = ? AND lab_id = ?", [
      req.params.id,
      labId,
    ])

    if (enrollmentRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Student already enrolled in this lab",
      })
    }

    // Create enrollment
    const enrollmentId = generateUUID()
    await pool.query("INSERT INTO enrollment (id, student_id, lab_id) VALUES (?, ?, ?)", [
      enrollmentId,
      req.params.id,
      labId,
    ])

    // Get created enrollment
    const [newEnrollmentRows] = await pool.query("SELECT * FROM enrollment WHERE id = ?", [enrollmentId])

    res.status(201).json({
      success: true,
      data: formatRow(newEnrollmentRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Leave lab
// @route   DELETE /api/students/:id/leave/:labId
// @access  Private/Student
export const leaveLab = async (req, res) => {
  try {
    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if user is the student
    if (req.user.role === "STUDENT" && req.user.student.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove this student",
      })
    }

    // Check if enrollment exists
    const [enrollmentRows] = await pool.query("SELECT * FROM enrollment WHERE student_id = ? AND lab_id = ?", [
      req.params.id,
      req.params.labId,
    ])

    if (enrollmentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not enrolled in this lab",
      })
    }

    // Delete enrollment
    await pool.query("DELETE FROM enrollment WHERE student_id = ? AND lab_id = ?", [req.params.id, req.params.labId])

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

// @desc    Get student's labs
// @route   GET /api/students/:id/labs
// @access  Private/Student
export const getStudentLabs = async (req, res) => {
  try {
    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if user is the student
    if (req.user.role === "STUDENT" && req.user.student.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this student's labs",
      })
    }

    // Get student's labs
    const [labRows] = await pool.query(
      `
      SELECT l.*, t.name as teacher_name, t.department as teacher_department
      FROM lab l
      JOIN enrollment e ON l.id = e.lab_id
      JOIN teacher t ON l.teacher_id = t.id
      WHERE e.student_id = ?
    `,
      [req.params.id],
    )

    // Get timetables, notices, and practicals for each lab
    const labs = await Promise.all(
      labRows.map(async (lab) => {
        const [timetableRows] = await pool.query("SELECT * FROM timetable WHERE lab_id = ?", [lab.id])

        const [noticeRows] = await pool.query("SELECT * FROM notice WHERE lab_id = ?", [lab.id])

        const [practicalRows] = await pool.query("SELECT * FROM practical WHERE lab_id = ?", [lab.id])

        return {
          ...formatRow(lab),
          teacher: {
            id: lab.teacher_id,
            name: lab.teacher_name,
            department: lab.teacher_department,
          },
          timetables: formatRows(timetableRows),
          notices: formatRows(noticeRows),
          practicals: formatRows(practicalRows),
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

// @desc    Get student's attendance
// @route   GET /api/students/:id/attendance/:labId
// @access  Private/Student
export const getStudentAttendance = async (req, res) => {
  try {
    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if user is the student
    if (req.user.role === "STUDENT" && req.user.student.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this student's attendance",
      })
    }

    // Get student's attendance for a specific lab
    const [attendanceRows] = await pool.query(
      "SELECT * FROM attendance WHERE student_id = ? AND lab_id = ? ORDER BY date DESC",
      [req.params.id, req.params.labId],
    )

    // Calculate attendance percentage
    const totalClasses = attendanceRows.length
    const presentClasses = attendanceRows.filter((a) => a.is_present).length
    const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

    res.status(200).json({
      success: true,
      count: attendanceRows.length,
      attendancePercentage,
      data: formatRows(attendanceRows),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get student's submissions
// @route   GET /api/students/:id/submissions
// @access  Private/Student
export const getStudentSubmissions = async (req, res) => {
  try {
    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if user is the student
    if (req.user.role === "STUDENT" && req.user.student.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this student's submissions",
      })
    }

    // Get student's submissions
    const [submissionRows] = await pool.query(
      `
      SELECT s.*, p.title as practical_title, p.deadline as practical_deadline, 
             l.subject_name as lab_subject_name, l.subject_code as lab_subject_code
      FROM submission s
      JOIN practical p ON s.practical_id = p.id
      JOIN lab l ON p.lab_id = l.id
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC
    `,
      [req.params.id],
    )

    // Get marks for each submission
    const submissions = await Promise.all(
      submissionRows.map(async (submission) => {
        const [markRows] = await pool.query("SELECT * FROM mark WHERE submission_id = ?", [submission.id])

        return {
          ...formatRow(submission),
          practical: {
            id: submission.practical_id,
            title: submission.practical_title,
            deadline: submission.practical_deadline,
          },
          lab: {
            subjectName: submission.lab_subject_name,
            subjectCode: submission.lab_subject_code,
          },
          marks: markRows.length > 0 ? formatRow(markRows[0]) : null,
        }
      }),
    )

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Submit practical
// @route   POST /api/students/:id/submit
// @access  Private/Student
export const submitPractical = async (req, res) => {
  try {
    const { practicalId, fileUrl } = req.body

    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if user is the student
    if (req.user.role === "STUDENT" && req.user.student.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit for this student",
      })
    }

    // Check if practical exists
    const [practicalRows] = await pool.query(
      `
      SELECT p.*, l.id as lab_id
      FROM practical p
      JOIN lab l ON p.lab_id = l.id
      WHERE p.id = ?
    `,
      [practicalId],
    )

    if (practicalRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Practical not found",
      })
    }

    const practical = formatRow(practicalRows[0])

    // Check if student is enrolled in the lab
    const [enrollmentRows] = await pool.query("SELECT * FROM enrollment WHERE student_id = ? AND lab_id = ?", [
      req.params.id,
      practical.labId,
    ])

    if (enrollmentRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student not enrolled in this lab",
      })
    }

    // Check if deadline has passed
    if (new Date() > new Date(practical.deadline)) {
      return res.status(400).json({
        success: false,
        message: "Deadline has passed",
      })
    }

    // Check if already submitted
    const [existingSubmissionRows] = await pool.query(
      "SELECT * FROM submission WHERE student_id = ? AND practical_id = ?",
      [req.params.id, practicalId],
    )

    let submissionId

    // Create or update submission
    if (existingSubmissionRows.length > 0) {
      submissionId = existingSubmissionRows[0].id
      await pool.query("UPDATE submission SET file_url = ?, updated_at = NOW() WHERE id = ?", [fileUrl, submissionId])
    } else {
      submissionId = generateUUID()
      await pool.query("INSERT INTO submission (id, file_url, practical_id, student_id) VALUES (?, ?, ?, ?)", [
        submissionId,
        fileUrl,
        practicalId,
        req.params.id,
      ])
    }

    // Get updated submission
    const [submissionRows] = await pool.query("SELECT * FROM submission WHERE id = ?", [submissionId])

    res.status(201).json({
      success: true,
      data: formatRow(submissionRows[0]),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get student's marks
// @route   GET /api/students/:id/marks/:labId
// @access  Private/Student
export const getStudentMarks = async (req, res) => {
  try {
    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM student WHERE id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if user is the student
    if (req.user.role === "STUDENT" && req.user.student.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this student's marks",
      })
    }

    // Get lab
    const [labRows] = await pool.query("SELECT * FROM lab WHERE id = ?", [req.params.labId])

    if (labRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      })
    }

    const lab = formatRow(labRows[0])

    // Get student's submissions for this lab
    const [submissionRows] = await pool.query(
      `
      SELECT s.*, p.title as practical_title
      FROM submission s
      JOIN practical p ON s.practical_id = p.id
      WHERE s.student_id = ? AND p.lab_id = ?
    `,
      [req.params.id, req.params.labId],
    )

    // Get marks for each submission
    const submissions = await Promise.all(
      submissionRows.map(async (submission) => {
        const [markRows] = await pool.query("SELECT * FROM mark WHERE submission_id = ?", [submission.id])

        return {
          id: submission.id,
          practicalTitle: submission.practical_title,
          submittedAt: submission.submitted_at,
          marks: markRows.length > 0 ? formatRow(markRows[0]) : null,
        }
      }),
    )

    // Get student's attendance for this lab
    const [attendanceRows] = await pool.query("SELECT * FROM attendance WHERE student_id = ? AND lab_id = ?", [
      req.params.id,
      req.params.labId,
    ])

    // Calculate attendance percentage
    const totalClasses = attendanceRows.length
    const presentClasses = attendanceRows.filter((a) => a.is_present).length
    const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

    // Calculate total marks
    let totalPracticalMarks = 0
    let totalVivaMarks = 0

    submissions.forEach((submission) => {
      if (submission.marks) {
        totalPracticalMarks += submission.marks.practicalMark
        totalVivaMarks += submission.marks.vivaMark
      }
    })

    // Calculate attendance marks based on percentage
    const attendanceMarks = (attendancePercentage / 100) * lab.attendanceMarks

    // Calculate total marks
    const totalMarks = attendanceMarks + totalPracticalMarks + totalVivaMarks
    const maxMarks = lab.attendanceMarks + lab.practicalMarks + lab.vivaMarks

    res.status(200).json({
      success: true,
      data: {
        attendanceMarks,
        totalPracticalMarks,
        totalVivaMarks,
        totalMarks,
        maxMarks,
        percentage: (totalMarks / maxMarks) * 100,
        submissions,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
