import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { Loader } from "../../components/Loader"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class StudentLabs extends AbstractView {
  constructor(params) {
    super(params)
    this.setTitle("My Labs")
    this.enrolledLabs = []
    this.availableLabs = []
    this.isLoading = true
  }

  async getHtml() {
    return `
      ${Navbar()}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">My Labs</h1>
        </div>
        
        <div id="labs-container">
          ${Loader()}
        </div>
        
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Available Labs</h2>
          <div id="available-labs-container">
            ${Loader()}
          </div>
        </div>
      </div>
    `
  }

  async fetchLabs() {
    try {
      const user = window.auth.getUser()
      const studentId = user.student.id

      // Fetch enrolled labs
      const enrolledResponse = await ApiService.get(`/students/${studentId}/labs`)
      this.enrolledLabs = enrolledResponse.data

      // Fetch all labs
      const allLabsResponse = await ApiService.get("/labs")
      const allLabs = allLabsResponse.data

      // Filter out enrolled labs
      const enrolledLabIds = this.enrolledLabs.map((lab) => lab.id)
      this.availableLabs = allLabs.filter((lab) => !enrolledLabIds.includes(lab.id))

      this.renderLabs()
    } catch (error) {
      Toast.show(error.message || "Failed to fetch labs", "error")
    } finally {
      this.isLoading = false
    }
  }

  renderLabs() {
    const labsContainer = document.getElementById("labs-container")
    const availableLabsContainer = document.getElementById("available-labs-container")

    if (this.enrolledLabs.length === 0) {
      labsContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500">You are not enrolled in any labs yet.</p>
        </div>
      `
    } else {
      labsContainer.innerHTML = `
        <div class="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.enrolledLabs
            .map(
              (lab) => `
            <div class="card border rounded-xl border-gray-200 hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-gray-900">${lab.subjectName}</h3>
              <p class="text-sm text-gray-500 mb-2">Code: ${lab.subjectCode}</p>
              <p class="text-sm text-gray-700 mb-4">Teacher: ${lab.teacher.name}</p>
              <div class="flex justify-between">
                <a href="/student/labs/${lab.id}" data-link class="rounded-xl btn btn-primary text-sm">View Details</a>
                <button class="rounded-xl btn btn-danger text-sm leave-lab-btn" data-lab-id="${lab.id}">Leave Lab</button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `

      // Add event listeners for leave buttons
      document.querySelectorAll(".leave-lab-btn").forEach((btn) => {
        btn.addEventListener("click", this.handleLeaveLab.bind(this))
      })
    }

    if (this.availableLabs.length === 0) {
      availableLabsContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500">No available labs to enroll.</p>
        </div>
      `
    } else {
      availableLabsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.availableLabs
            .map(
              (lab) => `
            <div class="card rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-gray-900">${lab.subjectName}</h3>
              <p class="text-sm text-gray-500 mb-2">Code: ${lab.subjectCode}</p>
              <p class="text-sm text-gray-700 mb-4">Teacher: ${lab.teacher.name}</p>
              <button class="rounded-xl btn btn-primary w-full enroll-btn" data-lab-id="${lab.id}">Enroll</button>
            </div>
          `,
            )
            .join("")}
        </div>
      `

      // Add event listeners for enroll buttons
      document.querySelectorAll(".enroll-btn").forEach((btn) => {
        btn.addEventListener("click", this.handleEnroll.bind(this))
      })
    }
  }

  async handleEnroll(e) {
    const labId = e.target.dataset.labId
    const user = window.auth.getUser()
    const studentId = user.student.id

    try {
      await ApiService.post(`/students/${studentId}/enroll`, { labId })
      Toast.show("Successfully enrolled in lab")
      await this.fetchLabs()
    } catch (error) {
      Toast.show(error.message || "Failed to enroll in lab", "error")
    }
  }

  async handleLeaveLab(e) {
    const labId = e.target.dataset.labId
    const user = window.auth.getUser()
    const studentId = user.student.id

    if (confirm("Are you sure you want to leave this lab?")) {
      try {
        await ApiService.delete(`/students/${studentId}/leave/${labId}`)
        Toast.show("Successfully left lab")
        await this.fetchLabs()
      } catch (error) {
        Toast.show(error.message || "Failed to leave lab", "error")
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
