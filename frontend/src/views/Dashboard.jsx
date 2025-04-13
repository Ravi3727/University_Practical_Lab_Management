import { AbstractView } from "./AbstractView"
import { Navbar } from "../components/Navbar"

export class Dashboard extends AbstractView {
  constructor(params) {
    super(params)
    this.setTitle("Dashboard")
  }

  async getHtml() {
    const user = window.auth.getUser()
    const isStudent = user.role === "STUDENT"
    const isTeacher = user.role === "TEACHER"

    return `
      ${Navbar()}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="card rounded-xl">
          <h1 class="text-2xl font-bold text-gray-900 mb-6">Welcome to the Lab Management System</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${isStudent
        ? `
              <div class="card rounded-xl bg-primary-50 border border-primary-200">
                <h2 class="text-xl font-semibold text-primary-800 mb-4">Student Dashboard</h2>
                <p class="text-gray-700 mb-4">Manage your lab enrollments, submissions, and check your attendance and marks.</p>
                <div class="flex flex-col space-y-2">
                  <a href="/student/labs" data-link class="text-center rounded-xl btn btn-primary">View My Labs</a>
                  <a href="/student/submissions" data-link class="text-center rounded-xl btn btn-secondary">View My Submissions</a>
                </div>
              </div>
            `
        : ""
      }
            
            ${isTeacher
        ? `
              <div class="card rounded-xl bg-primary-50 border border-primary-200">
                <h2 class="text-xl font-semibold text-primary-800 mb-4">Teacher Dashboard</h2>
                <p class="text-gray-700 mb-4">Manage your labs, create practicals, mark attendance, and grade student submissions.</p>
                <div class="flex flex-col  space-y-2">
                  <a href="/teacher/labs" data-link class="text-center rounded-xl btn btn-primary">View My Labs</a>
                  <a href="/teacher/create-lab" data-link class= "text-center p-2 rounded-xl btn btn-secondary   ">Create New Lab</a>
                </div>
              </div>
            `
        : ""
      }
            
            <div class="card rounded-xl bg-gray-50 border border-gray-200">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
              <div class="space-y-2">
                <p><span class="font-medium">Email:</span> ${user.email}</p>
                <p><span class="font-medium">Role:</span> ${user.role}</p>
                ${isStudent && user.student
        ? `
                  <p><span class="font-medium">Name:</span> ${user.student.name}</p>
                  <p><span class="font-medium">Roll No:</span> ${user.student.rollNo}</p>
                  <p><span class="font-medium">Branch:</span> ${user.student.branchName}</p>
                  <p><span class="font-medium">Semester:</span> ${user.student.semester}</p>
                `
        : ""
      }
                ${isTeacher && user.teacher
        ? `
                  <p><span class="font-medium">Name:</span> ${user.teacher.name}</p>
                  <p><span class="font-medium">Department:</span> ${user.teacher.department}</p>
                `
        : ""
      }
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  afterRender() {
    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.auth.logout()
      })
    }
  }
}
