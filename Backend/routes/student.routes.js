import express from "express"
import {
  getStudents,
  getStudent,
  updateStudent,
  enrollInLab,
  leaveLab,
  getStudentLabs,
  getStudentAttendance,
  getStudentSubmissions,
  submitPractical,
  getStudentMarks,
} from "../controllers/student.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protect, authorize("TEACHER", "ADMIN"), getStudents)
router.get("/:id", protect, getStudent)
router.put("/:id", protect, updateStudent)
router.post("/:id/enroll", protect, enrollInLab)
router.delete("/:id/leave/:labId", protect, leaveLab)
router.get("/:id/labs", protect, getStudentLabs)
router.get("/:id/attendance/:labId", protect, getStudentAttendance)
router.get("/:id/submissions", protect, getStudentSubmissions)
router.post("/:id/submit", protect, submitPractical)
router.get("/:id/marks/:labId", protect, getStudentMarks)

export default router
