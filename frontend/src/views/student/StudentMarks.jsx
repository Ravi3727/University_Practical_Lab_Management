import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { Loader } from "../../components/Loader"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class StudentMarks extends AbstractView {
  constructor(params) {
    super(params)
    this.labId = params.labId
    this.marks = null
    this.lab = null
    this.isLoading = true
    this.setTitle("Marks")
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
        
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Marks</h1>
        
        <div id="marks-container">
          ${Loader()}
        </div>
      </div>
    `
  }

  async fetchMarks() {
    try {
      const user = window.auth.getUser()
      const studentId = user.student.id

      // Fetch lab details
      const labResponse = await ApiService.get(`/labs/${this.labId}`)
      this.lab = labResponse.data

      // Fetch marks
      const marksResponse = await ApiService.get(`/students/${studentId}/marks/${this.labId}`)
      this.marks = marksResponse.data
      // console.log(this.marks)
      this.renderMarks()
    } catch (error) {
      Toast.show(error.message || "Failed to fetch marks", "error")
    } finally {
      this.isLoading = false
    }
  }

  renderMarks() {
    const marksContainer = document.getElementById("marks-container")

    if (!this.lab) {
      marksContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-500">Lab not found</p>
        </div>
      `
      return
    }

    if (!this.marks) {
      marksContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500">No marks available yet.</p>
        </div>
      `
      return
    }

    marksContainer.innerHTML = `
      <div class="card mb-6 rounded-xl">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">${this.lab.subjectName} (${this.lab.subjectCode})</h2>
        
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="text-sm text-gray-500">Attendance Marks</p>
            <p class="text-2xl font-bold text-gray-900">${this.marks?.attendanceMarks?.toFixed(2)}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="text-sm text-gray-500">Practical Marks</p>
            <p class="text-2xl font-bold text-gray-900">${this.marks?.totalPracticalMarks?.toFixed(2)}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="text-sm text-gray-500">Viva Marks</p>
            <p class="text-2xl font-bold text-gray-900">${this.marks?.totalVivaMarks?.toFixed(2)}</p>
          </div>
        </div>
        
        <div class="mt-6">
          <div class="flex justify-between items-center mb-2">
            <p class="font-medium">Total Marks</p>
            <p class="font-bold">${this.marks?.totalMarks?.toFixed(2)} / ${this?.marks?.maxMarks?.toFixed(2)}</p>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4">
            <div class="bg-primary-600 h-4 rounded-full" style="width: ${this.marks.percentage}%"></div>
          </div>
          <p class="mt-2 text-sm text-gray-500 text-right">${this?.marks?.percentage?.toFixed(2)}%</p>
        </div>
      </div>
      
      <div class="card rounded-xl">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Submission Marks</h2>
        
        ${
          this.marks.submissions?.length === 0
            ? `
          <p class="text-gray-500">No submissions graded yet.</p>
        `
            : `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practical</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practical Marks</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viva Marks</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${this.marks.submissions
                  ?.map(
                    (submission) => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${submission.practicalTitle}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(submission.submittedAt).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${submission.marks ? submission.marks?.practicalMark?.toFixed(2) : "Not graded"}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${submission.marks ? submission.marks?.vivaMark?.toFixed(2) : "Not graded"}
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

    this.fetchMarks()
  }
}
