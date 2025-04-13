import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { Loader } from "../../components/Loader"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class StudentSubmissions extends AbstractView {
  constructor(params) {
    super(params)
    this.submissions = []
    this.isLoading = true
    this.setTitle("My Submissions")
  }

  async getHtml() {
    return `
      ${Navbar()}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">My Submissions</h1>
        
        <div id="submissions-container">
          ${Loader()}
        </div>
      </div>
    `
  }

  async fetchSubmissions() {
    try {
      const user = window.auth.getUser()
      const studentId = user.student.id

      const response = await ApiService.get(`/students/${studentId}/submissions`)
      this.submissions = response.data
      this.renderSubmissions()
    } catch (error) {
      Toast.show(error.message || "Failed to fetch submissions", "error")
    } finally {
      this.isLoading = false
    }
  }

  renderSubmissions() {
    const submissionsContainer = document.getElementById("submissions-container")

    if (this.submissions.length === 0) {
      submissionsContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500">You haven't submitted any practicals yet.</p>
        </div>
      `
    } else {
      submissionsContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practical</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File URL</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${this.submissions
                .map(
                  (submission) => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${submission.practical.title}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${submission.lab.subjectName}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(submission.submittedAt).toLocaleString()}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                    <a href="${submission.fileUrl}" target="_blank" class="hover:underline">View Submission</a>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${
                      submission.marks
                        ? `
                      <span class="font-medium">${submission.marks.practicalMark + submission.marks.vivaMark}</span>
                    `
                        : "Not graded yet"
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
  }

  afterRender() {
    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.auth.logout()
      })
    }

    this.fetchSubmissions()
  }
}
