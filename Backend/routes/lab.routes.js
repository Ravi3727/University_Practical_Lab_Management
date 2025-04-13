import express from "express"
import {
  getLabs,
  getLab,
  getLabTimetable,
  getLabPracticals,
  getLabNotices,
  getLabStudents,
} from "../controllers/lab.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", getLabs)
router.get("/:id", getLab)
router.get("/:id/timetable", getLabTimetable)
router.get("/:id/practicals", getLabPracticals)
router.get("/:id/notices", getLabNotices)
router.get("/:id/students", protect, authorize("TEACHER"), getLabStudents)

export default router
