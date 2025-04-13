import express from "express"
import {
  getTeachers,
  getTeacher,
  updateTeacher,
  getTeacherLabs,
  createLab,
  updateLab,
  deleteLab,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  createPractical,
  updatePractical,
  deletePractical,
  markAttendance,
  createNotice,
  updateNotice,
  deleteNotice,
  gradeSubmission,
  getLabStudents,
} from "../controllers/teacher.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protect, authorize("ADMIN"), getTeachers)
router.get("/:id", protect, getTeacher)
router.put("/:id", protect, updateTeacher)
router.get("/:id/labs", protect, getTeacherLabs)
router.post("/:id/labs", protect, authorize("TEACHER"), createLab)
router.put("/:id/labs/:labId", protect, authorize("TEACHER"), updateLab)
router.delete("/:id/labs/:labId", protect, authorize("TEACHER"), deleteLab)
router.post("/:id/labs/:labId/timetable", protect, authorize("TEACHER"), createTimetable)
router.put("/:id/timetable/:timetableId", protect, authorize("TEACHER"), updateTimetable)
router.delete("/:id/timetable/:timetableId", protect, authorize("TEACHER"), deleteTimetable)
router.post("/:id/labs/:labId/practicals", protect, authorize("TEACHER"), createPractical)
router.put("/:id/practicals/:practicalId", protect, authorize("TEACHER"), updatePractical)
router.delete("/:id/practicals/:practicalId", protect, authorize("TEACHER"), deletePractical)
router.post("/:id/labs/:labId/attendance", protect, authorize("TEACHER"), markAttendance)
router.post("/:id/labs/:labId/notices", protect, authorize("TEACHER"), createNotice)
router.put("/:id/notices/:noticeId", protect, authorize("TEACHER"), updateNotice)
router.delete("/:id/notices/:noticeId", protect, authorize("TEACHER"), deleteNotice)
router.post("/:id/submissions/:submissionId/grade", protect, authorize("TEACHER"), gradeSubmission)
router.get("/:id/labs/:labId/students", protect, authorize("TEACHER"), getLabStudents)

export default router
