import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { Loader } from "../../components/Loader"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class TeacherLabs extends AbstractView {
  constructor(params) {
    super(params)
    this.labs = []
    this.isLoading = true
    this.setTitle("My Labs")
  }

  async getHtml() {
    return `
      ${Navbar()}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">My Labs</h1>
          <a href="/teacher/create-lab" data-link class="rounded-xl btn btn-primary">Create New Lab</a>
        </div>
        
        <div id="labs-container">
          ${Loader()}
        </div>
      </div>
    `
  }

  async fetchLabs() {
    try {
      const user = window.auth.getUser()
      const teacherId = user.teacher.id

      const response = await ApiService.get(`/teachers/${teacherId}/labs`)
      this.labs = response.data
      this.renderLabs()
    } catch (error) {
      Toast.show(error.message || "Failed to fetch labs", "error")
    } finally {
      this.isLoading = false
    }
  }

  renderLabs() {
    const labsContainer = document.getElementById("labs-container")

    if (this.labs.length === 0) {
      labsContainer.innerHTML = `
        <div class="text-center py-8  rounded-xl">
          <p class="text-gray-500">You haven't created any labs yet.</p>
          <a href="/teacher/create-lab" data-link class="btn btn-primary mt-4">Create Your First Lab</a>
        </div>
      `
    } else {
      labsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.labs
            .map(
              (lab) => `
            <div class=" rounded-xl card border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-gray-900">${lab.subjectName}</h3>
              <p class="text-sm text-gray-500 mb-2">Code: ${lab.subjectCode}</p>
              <p class="text-sm text-gray-700 mb-2">Students: ${lab.enrollments ? lab.enrollments.length : 0}</p>
              <p class="text-sm text-gray-700 mb-4">Practicals: ${lab.practicals ? lab.practicals.length : 0}</p>
              <div class="flex flex-col space-y-2">
                <a href="/teacher/labs/${lab.id}" data-link class="rounded-xl btn btn-primary text-sm items-center text-center">Manage Lab</a>
                <button class="rounded-xl btn btn-danger text-sm delete-lab-btn" data-lab-id="${lab.id}">Delete Lab</button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `

      // Add event listeners for delete buttons
      document.querySelectorAll(".delete-lab-btn").forEach((btn) => {
        btn.addEventListener("click", this.handleDeleteLab.bind(this))
      })
    }
  }

  async handleDeleteLab(e) {
    const labId = e.target.dataset.labId
    const user = window.auth.getUser()
    const teacherId = user.teacher.id

    if (confirm("Are you sure you want to delete this lab? This action cannot be undone.")) {
      try {
        await ApiService.delete(`/teachers/${teacherId}/labs/${labId}`)
        Toast.show("Lab deleted successfully")
        await this.fetchLabs()
      } catch (error) {
        Toast.show(error.message || "Failed to delete lab", "error")
      }
    }
  }

  afterRender() {
    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.auth.logout()
      })
    }

    this.fetchLabs()
  }
}
