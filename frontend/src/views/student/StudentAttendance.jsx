import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { Loader } from "../../components/Loader"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class StudentAttendance extends AbstractView {
  constructor(params) {
    super(params)
    this.labId = params.labId
    this.attendance = []
    this.attendancePercentage = 0
    this.lab = null
    this.isLoading = true
    this.setTitle("Attendance")
  }

  async getHtml() {
    return `
      ${Navbar()}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
          <a href="/student/labs/${this.labId}" data-link class="text-primary-600 hover:text-primary-800">
            &larr; Back to Lab
          </a>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Attendance</h1>
        
        <div id="attendance-container">
          ${Loader()}
        </div>
      </div>
    `
  }

  async fetchAttendance() {
    try {
      const user = window.auth.getUser()
      const studentId = user.student.id

      // Fetch lab details
      const labResponse = await ApiService.get(`/labs/${this.labId}`)
      this.lab = labResponse.data

      // Fetch attendance
      const attendanceResponse = await ApiService.get(`/students/${studentId}/attendance/${this.labId}`)
      console.log(attendanceResponse.data)
      this.attendance = attendanceResponse.data
      this.attendancePercentage = attendanceResponse.data[0].isPresent*10;

      this.renderAttendance()
    } catch (error) {
      Toast.show(error.message || "Failed to fetch attendance", "error")
    } finally {
      this.isLoading = false
    }
  }

  renderAttendance() {
    const attendanceContainer = document.getElementById("attendance-container")

    if (!this.lab) {
      attendanceContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-500">Lab not found</p>
        </div>
      `
      return
    }

    attendanceContainer.innerHTML = `

      <div class="card mb-6 rounded-xl">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">${this.lab.subjectName} (${this.lab.subjectCode})</h2>
        
        ${this.attendance?.length === 0
            ? `
          <p class="text-gray-500">Not calculated yet.</p>
        `
            : 
        `<div class="mt-4">
          <div class="flex items-center">
            <div class="w-full bg-gray-200 rounded-full h-4">
              <div class="bg-primary-600 h-4 rounded-full" style="width: ${this.attendancePercentage}%"></div>
            </div>
            <span class="ml-4 font-medium">${this?.attendancePercentage}%</span>
          </div>
          
          <p class="mt-2 text-sm text-gray-500">
            Please keep your attendance up to date. You need at least 75% attendance to pass the lab.
          </p>
        </div>`}
      </div>
      
      <div class="card rounded-xl">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Attendance Records</h2>
        
        ${
          this.attendance?.length === 0
            ? `
          <p class="text-gray-500">No attendance records available.</p>
        `
            : `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${this.attendance
                  ?.map(
                    (record) => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(record.date).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      ${
                        record.isPresent
                          ? '<span class="text-green-500 font-medium">Present</span>'
                          : '<span class="text-red-500 font-medium">Absent</span>'
                      }
                    </td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
        }
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

    this.fetchAttendance()
  }
}
