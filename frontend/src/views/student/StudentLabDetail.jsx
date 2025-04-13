import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { Loader } from "../../components/Loader"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class StudentLabDetail extends AbstractView {
    constructor(params) {
        super(params)
        this.labId = params.id
        this.lab = null
        this.isLoading = true
        this.setTitle("Lab Details")
    }

    async getHtml() {
        return `
      ${Navbar()}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="lab-container">
          ${Loader()}
        </div>
      </div>
    `
    }

    async fetchLabDetails() {
        try {
            const response = await ApiService.get(`/labs/${this.labId}`)
            this.lab = response.data
            this.renderLabDetails()
        } catch (error) {
            Toast.show(error.message || "Failed to fetch lab details", "error")
        } finally {
            this.isLoading = false
        }
    }

    renderLabDetails() {
        const labContainer = document.getElementById("lab-container")

        if (!this.lab) {
            labContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-500">Lab not found</p>
        </div>
      `
            return
        }

        const user = window.auth.getUser()

        labContainer.innerHTML = `
      <div class="mb-6">
        <a href="/student/labs" data-link class="text-primary-600 hover:text-primary-800">
          &larr; Back to My Labs
        </a>
      </div>
      
      <div class="card mb-6 rounded-xl">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">${this.lab.subjectName}</h1>
            <p class="text-gray-500">Code: ${this.lab.subjectCode}</p>
          </div>
          <div class="flex space-x-2">
            <a href="/student/attendance/${this.lab.id}" data-link class="btn btn-secondary rounded-xl">View Attendance</a>
            <a href="/student/marks/${this.lab.id}" data-link class="btn btn-secondary rounded-xl">View Marks</a>
          </div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Teacher Information</h2>
          <p><span class="font-medium">Name:</span> ${this.lab.teacher.name}</p>
          <p><span class="font-medium">Department:</span> ${this.lab.teacher.department}</p>
        </div>
        
        <div class="mt-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Syllabus</h2>
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="whitespace-pre-line">${this.lab.syllabus}</p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card rounded-xl">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Timetable</h2>
          ${this.lab.timetables.length === 0
                ? `
            <p class="text-gray-500">No timetable entries available.</p>
          `
                : `
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  ${this.lab.timetables
                    .map(
                        (timetable) => `
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${timetable.day}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${timetable.startTime} - ${timetable.endTime}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${timetable.room}</td>
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
        
        <div class="card rounded-xl">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Notices</h2>
          ${this.lab.notices.length === 0
                ? `
            <p class="text-gray-500">No notices available.</p>
          `
                : `
            <div class="space-y-4">
              ${this.lab.notices
                    .map(
                        (notice) => `
                <div class="border rounded-xl border-gray-200 p-4">
                  <h3 class="font-medium text-gray-900">${notice.title}</h3>
                  <p class="text-sm text-gray-500 mb-2">Posted on ${new Date(notice.createdAt).toLocaleDateString()}</p>
                  <p class="text-gray-700">${notice.content}</p>
                </div>
              `,
                    )
                    .join("")}
            </div>
          `
            }
        </div>
      </div>
      
      <div class="card mt-6 rounded-xl">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Practicals</h2>
        ${this.lab.practicals.length === 0
                ? `
          <p class="text-gray-500">No practicals assigned yet.</p>
        `
                : `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${this.lab.practicals
                    .map(
                        (practical) => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${practical.title}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(practical.deadline).toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      ${new Date() > new Date(practical.deadline)
                                ? '<span class="text-red-500">Deadline Passed</span>'
                                : '<span class="text-green-500">Open</span>'
                            }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button class="rounded-xl btn btn-primary text-xs view-practical-btn" data-practical-id="${practical.id}">
                        View & Submit
                      </button>
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

        <div class="card mt-6 rounded-xl">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Marking Scheme</h2>
          <p><span class="font-medium">Attendance :</span> ${this.lab.attendanceMarks}</p>
          <p><span class="font-medium">Lab File:</span> ${this.lab.practicalMarks}</p>
          <p><span class="font-medium">Practical :</span> ${this.lab.vivaMarks
            }</p>
        </div>
    `


        // Add event listeners for practical buttons
        document.querySelectorAll(".view-practical-btn").forEach((btn) => {
            btn.addEventListener("click", this.handleViewPractical.bind(this))
        })
    }

    handleViewPractical(e) {
        const practicalId = e.target.dataset.practicalId
        const practical = this.lab.practicals.find((p) => p.id === practicalId)

        if (!practical) return

        const user = window.auth.getUser()
        const studentId = user.student.id

        // Create modal
        const modal = document.createElement("div")
        modal.className = "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
        modal.id = "practical-modal"

        modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">${practical.title}</h2>
            <button id="close-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mt-4">
            <p class="text-sm text-gray-500 mb-2">Deadline: ${new Date(practical.deadline).toLocaleString()}</p>
            <div class="bg-gray-50 p-4 rounded-md mb-4">
              <p class="whitespace-pre-line">${practical.description}</p>
            </div>
            
            <form id="submission-form" class="mt-6">
              <div class="form-group">
                <label for="fileUrl" class="label">Submission URL (Google Drive, GitHub, etc.)</label>
                <input type="url" id="fileUrl" name="fileUrl" class="rounded-xl input" required placeholder="https://...">
              </div>
              
              <div class="flex justify-end mt-4">
                <button type="submit" class="rounded-xl btn btn-primary" ${new Date() > new Date(practical.deadline) ? "disabled" : ""}>
                  Submit Practical
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `

        document.body.appendChild(modal)

        // Add event listeners
        document.getElementById("close-modal").addEventListener("click", () => {
            document.getElementById("practical-modal").remove()
        })

        document.getElementById("submission-form").addEventListener("submit", async (e) => {
            e.preventDefault()

            const fileUrl = document.getElementById("fileUrl").value

            try {
                await ApiService.post(`/students/${studentId}/submit`, {
                    practicalId: practical.id,
                    fileUrl,
                })

                Toast.show("Practical submitted successfully")
                document.getElementById("practical-modal").remove()
            } catch (error) {
                Toast.show(error.message || "Failed to submit practical", "error")
            }
        })
    }

    afterRender() {
        const logoutBtn = document.getElementById("logout-btn")
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                window.auth.logout()
            })
        }

        this.fetchLabDetails()
    }
}
