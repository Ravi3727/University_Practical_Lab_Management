import { Dashboard } from "./views/Dashboard"
import { Login } from "./views/Login"
import { Register } from "./views/Register"
import { StudentLabs } from "./views/student/StudentLabs"
import { StudentLabDetail } from "./views/student/StudentLabDetail"
import { StudentSubmissions } from "./views/student/StudentSubmissions"
import { StudentAttendance } from "./views/student/StudentAttendance"
import { StudentMarks } from "./views/student/StudentMarks"
import { TeacherLabs } from "./views/teacher/TeacherLabs"
import { TeacherLabDetail } from "./views/teacher/TeacherLabDetail"
import { TeacherCreateLab } from "./views/teacher/TeacherCreateLab"
import { TeacherPracticals } from "./views/teacher/TeacherPracticals"
import { TeacherStudents } from "./views/teacher/TeacherStudents"
import { NotFound } from "./views/NotFound"

const routes = [
  { path: "/", view: Dashboard, protected: true },
  { path: "/login", view: Login },
  { path: "/register", view: Register },
  { path: "/student/labs", view: StudentLabs, protected: true, role: "STUDENT" },
  { path: "/student/labs/:id", view: StudentLabDetail, protected: true, role: "STUDENT" },
  { path: "/student/submissions", view: StudentSubmissions, protected: true, role: "STUDENT" },
  { path: "/student/attendance/:labId", view: StudentAttendance, protected: true, role: "STUDENT" },
  { path: "/student/marks/:labId", view: StudentMarks, protected: true, role: "STUDENT" },
  { path: "/teacher/labs", view: TeacherLabs, protected: true, role: "TEACHER" },
  { path: "/teacher/labs/:id", view: TeacherLabDetail, protected: true, role: "TEACHER" },
  { path: "/teacher/create-lab", view: TeacherCreateLab, protected: true, role: "TEACHER" },
  { path: "/teacher/labs/:id/practicals", view: TeacherPracticals, protected: true, role: "TEACHER" },
  { path: "/teacher/labs/:id/students", view: TeacherStudents, protected: true, role: "TEACHER" },
]

function pathToRegex(path) {
  return new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "([^/]+)") + "$")
}

function getParams(match) {
  const values = match.result.slice(1)
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map((result) => result[1])

  return Object.fromEntries(keys.map((key, i) => [key, values[i]]))
}

export const router = {
  route: async () => {
    // Check authentication
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "null")
    const isAuthenticated = !!token

    // Find the matching route
    const potentialMatches = routes.map((route) => {
      return {
        route: route,
        result: location.pathname.match(pathToRegex(route.path)),
      }
    })

    let match = potentialMatches.find((potentialMatch) => potentialMatch.result !== null)

    if (!match) {
      match = {
        route: { path: "/not-found", view: NotFound },
        result: [location.pathname],
      }
    }

    // Check if route is protected
    if (match.route.protected && !isAuthenticated) {
      window.navigateTo("/login")
      return
    }

    // Check role-based access
    if (match.route.role && user && user.role !== match.route.role) {
      window.navigateTo("/")
      return
    }

    const view = new match.route.view(getParams(match))

    document.querySelector("#app").innerHTML = await view.getHtml()

    // Call the afterRender method if it exists
    if (typeof view.afterRender === "function") {
      view.afterRender()
    }
  },
}
  