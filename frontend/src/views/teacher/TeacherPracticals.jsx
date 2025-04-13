import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { Loader } from "../../components/Loader"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class TeacherPracticals extends AbstractView {
  constructor(params) {
    super(params)
    this.labId = params.id
    this.lab = null
    this.practicals = []
    this.isLoading = true
    this.setTitle("Manage Practicals")
  }

  async getHtml() {
    return `
      ${Navbar()}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
          <a href="/teacher/labs/${this.labId}" data-link class="text-primary-600 hover:text-primary-800">
            &larr; Back to Lab
          </a>
        </div>
        
        <div id="practicals-container">
          ${Loader()}
        </div>
      </div>
    `
  }

  async fetchPracticals() {
    try {
      // Fetch lab details
      const labResponse = await ApiService.get(`/labs/${this.labId}`)
      this.lab = labResponse.data

      // Fetch practicals
      const practicalsResponse = await ApiService.get(`/labs/${this.labId}/practicals`)
      this.practicals = practicalsResponse.data

      this.renderPracticals()
    } catch (error) {
      Toast.show(error.message || "Failed to fetch practicals", "error")
    } finally {
      this.isLoading = false
    }
  }

  renderPracticals() {
    const practicalsContainer = document.getElementById("practicals-container")

    if (!this.lab) {
      practicalsContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-500">Lab not found</p>
        </div>
      `
      return
    }

    practicalsContainer.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Manage Practicals - ${this.lab.subjectName}</h1>
        <button id="add-practical-btn" class="btn btn-primary">Add New Practical</button>
      </div>
      
      <div class="card">
        ${
          this.practicals.length === 0
            ? `
          <div class="text-center py-8">
            <p class="text-gray-500">No practicals assigned yet.</p>
          </div>
        `
            : `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${this.practicals
                  .map(
                    (practical) => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${practical.title}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(practical.deadline).toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      ${
                        new Date() > new Date(practical.deadline)
                          ? '<span class="text-red-500">Deadline Passed</span>'
                          : '<span class="text-green-500">Open</span>'
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button class="text-primary-600 hover:text-primary-800 mr-2 view-submissions-btn" data-practical-id="${practical.id}">View Submissions</button>
                      <button class="text-primary-600 hover:text-primary-800 mr-2 edit-practical-btn" data-practical-id="${practical.id}">Edit</button>
                      <button class="text-red-600 hover:text-red-800 delete-practical-btn" data-practical-id="${practical.id}">Delete</button>
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

    // Add event listeners
    this.addEventListeners()
  }

  addEventListeners() {
    const user = window.auth.getUser()
    const teacherId = user.teacher.id

    // Add practical button
    document.getElementById("add-practical-btn").addEventListener("click", () => {
      this.showPracticalModal()
    })

    // Edit practical buttons
    document.querySelectorAll(".edit-practical-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const practicalId = e.target.dataset.practicalId
        const practical = this.practicals.find((p) => p.id === practicalId)
        if (practical) {
          this.showPracticalModal(practical)
        }
      })
    })

    // Delete practical buttons
    document.querySelectorAll(".delete-practical-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const practicalId = e.target.dataset.practicalId
        if (confirm("Are you sure you want to delete this practical?")) {
          try {
            await ApiService.delete(`/teachers/${teacherId}/practicals/${practicalId}`)
            Toast.show("Practical deleted successfully")
            this.fetchPracticals()
          } catch (error) {
            Toast.show(error.message || "Failed to delete practical", "error")
          }
        }
      })
    })

    // View submissions buttons
    document.querySelectorAll(".view-submissions-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const practicalId = e.target.dataset.practicalId
        this.showSubmissionsModal(practicalId)
      })
    })
  }

  showPracticalModal(practical = null) {
    const user = window.auth.getUser()
    const teacherId = user.teacher.id
    const isEditing = !!practical

    // Create modal
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    modal.id = "practical-modal"

    // Format deadline for input
    let deadlineValue = ""
    if (practical) {
      const deadline = new Date(practical.deadline)
      const year = deadline.getFullYear()
      const month = String(deadline.getMonth() + 1).padStart(2, "0")
      const day = String(deadline.getDate()).padStart(2, "0")
      const hours = String(deadline.getHours()).padStart(2, "0")
      const minutes = String(deadline.getMinutes()).padStart(2, "0")
      deadlineValue = `${year}-${month}-${day}T${hours}:${minutes}`
    }

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">${isEditing ? "Edit" : "Add"} Practical</h2>
            <button id="close-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form id="practical-form" class="mt-6 space-y-6">
            <div class="form-group">
              <label for="title" class="label">Title</label>
              <input type="text" id="title" name="title" class="input" value="${practical ? practical.title : ""}" required>
            </div>
            
            <div class="form-group">
              <label for="description" class="label">Description</label>
              <textarea id="description" name="description" rows="6" class="input" required>${practical ? practical.description : ""}</textarea>
            </div>
            
            <div class="form-group">
              <label for="deadline" class="label">Deadline</label>
              <input type="datetime-local" id="deadline" name="deadline" class="input" value="${deadlineValue}" required>
            </div>
            
            <div id="error-message" class="text-red-500 text-center hidden"></div>
            
            <div class="flex justify-end">
              <button type="submit" class="btn btn-primary">${isEditing ? "Save Changes" : "Add Practical"}</button>
            </div>
          </form>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listeners
    document.getElementById("close-modal").addEventListener("click", () => {
      document.getElementById("practical-modal").remove()
    })

    document.getElementById("practical-form").addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        deadline: document.getElementById("deadline").value,
      }

      try {
        const errorMessage = document.getElementById("error-message")
        errorMessage.classList.add("hidden")

        if (isEditing) {
          await ApiService.put(`/teachers/${teacherId}/practicals/${practical.id}`, formData)
          Toast.show("Practical updated successfully")
        } else {
          await ApiService.post(`/teachers/${teacherId}/labs/${this.labId}/practicals`, formData)
          Toast.show("Practical added successfully")
        }

        document.getElementById("practical-modal").remove()
        this.fetchPracticals()
      } catch (error) {
        const errorMessage = document.getElementById("error-message")
        errorMessage.textContent = error.message || "Failed to save practical"
        errorMessage.classList.remove("hidden")
      }
    })
  }

  async showSubmissionsModal(practicalId) {
    const practical = this.practicals.find((p) => p.id === practicalId)
    if (!practical) return

    // Create modal
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    modal.id = "submissions-modal"

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">Submissions for ${practical.title}</h2>
            <button id="close-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div id="submissions-container" class="mt-6">
            ${Loader()}
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listener for close button
    document.getElementById("close-modal").addEventListener("click", () => {
      document.getElementById("submissions-modal").remove()
    })

    // Fetch submissions
    try {
      const user = window.auth.getUser()
      const teacherId = user.teacher.id

      // Get students in this lab
      const studentsResponse = await ApiService.get(`/teachers/${teacherId}/labs/${this.labId}/students`)
      const students = studentsResponse.data

      // For each student, check if they have a submission for this practical
      const submissions = []

      for (const student of students) {
        const submissionsResponse = await ApiService.get(`/students/${student.id}/submissions`)
        const studentSubmissions = submissionsResponse.data
        const submission = studentSubmissions.find((s) => s.practical.id === practicalId)
        
        if (submission) {
          submissions.push({
            ...submission,
            student,
          })
        } else {
          submissions.push({
            id: null,
            student,
            submitted: false,
          })
        }
      }
      // Render submissions
      const submissionsContainer = document.getElementById("submissions-container")

      if (submissions.length === 0) {
        submissionsContainer.innerHTML = `
          <div class="text-center py-8">
            <p class="text-gray-500">No students enrolled in this lab.</p>
          </div>
        `
      } else {
        submissionsContainer.innerHTML = `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${submissions
                  .map(
                    (submission) => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${submission.student.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${submission.student.rollNo}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      ${
                        submission.fileUrl
                          ? '<span class="text-green-500">Submitted</span>'
                          : '<span class="text-red-500">Not Submitted</span>'
                      }
                    </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm">
                      ${
                        submission.fileUrl
                          ? `<a href="${submission.fileUrl}" target="_blank" class="text-primary-600 hover:underline">View Submission</a>`
                          : "-"
                      }
                    </td>
                    
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      ${
                        submission.fileUrl
                          ? `<button class="btn btn-primary text-xs grade-btn" data-submission-id="${submission.id}">
                          ${submission.marks ? "Update Grade" : "Grade"}
                        </button>`
                          : "-"
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

        // Add event listeners for grade buttons
        document.querySelectorAll(".grade-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const submissionId = e.target.dataset.submissionId
            const submission = submissions.find((s) => s.id === submissionId)
            if (submission) {
              this.showGradeModal(submission)
            }
          })
        })
      }
    } catch (error) {
      const submissionsContainer = document.getElementById("submissions-container")
      submissionsContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-500">${error.message || "Failed to fetch submissions"}</p>
        </div>
      `
    }
  }

  showGradeModal(submission) {
    const user = window.auth.getUser()
    const teacherId = user.teacher.id

    // Create modal
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    modal.id = "grade-modal"

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">Grade Submission</h2>
            <button id="close-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mt-4">
            <p><span class="font-medium">Student:</span> ${submission.student.name}</p>
            <p><span class="font-medium">Roll No:</span> ${submission.student.rollNo}</p>
            <p class="mt-2">
              <a href="${submission.fileUrl}" target="_blank" class="text-primary-600 hover:underline">View Submission</a>
            </p>
          </div>
          
          <form id="grade-form" class="mt-6 space-y-6">
            <div class="form-group">
              <label for="practicalMark" class="label">Practical Marks (out of ${this.lab.practicalMarks})</label>
              <input type="number" id="practicalMark" name="practicalMark" class="input" 
                value="${submission.marks ? submission.marks.practicalMark : ""}" 
                min="0" max="${this.lab.practicalMarks}" step="0.5" required>
            </div>
            
            <div class="form-group">
              <label for="vivaMark" class="label">Viva Marks (out of ${this.lab.vivaMarks})</label>
              <input type="number" id="vivaMark" name="vivaMark" class="input" 
                value="${submission.marks ? submission.marks.vivaMark : ""}" 
                min="0" max="${this.lab.vivaMarks}" step="0.5" required>
            </div>
            
            <div id="error-message" class="text-red-500 text-center hidden"></div>
            
            <div class="flex justify-end">
              <button type="submit" class="rounded-xl btn btn-primary">Save Grades</button>
            </div>
          </form>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listeners
    document.getElementById("close-modal").addEventListener("click", () => {
      document.getElementById("grade-modal").remove()
    })

    document.getElementById("grade-form").addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = {
        practicalMark: Number.parseFloat(document.getElementById("practicalMark").value),
        vivaMark: Number.parseFloat(document.getElementById("vivaMark").value),
      }

      try {
        const errorMessage = document.getElementById("error-message")
        errorMessage.classList.add("hidden")

        await ApiService.post(`/teachers/${teacherId}/submissions/${submission.id}/grade`, formData)

        Toast.show("Grades saved successfully")
        document.getElementById("grade-modal").remove()

        // Refresh the submissions modal
        document.getElementById("submissions-modal").remove()
        this.showSubmissionsModal(submission.practical.id)
      } catch (error) {
        const errorMessage = document.getElementById("error-message")
        errorMessage.textContent = error.message || "Failed to save grades"
        errorMessage.classList.remove("hidden")
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

    this.fetchPracticals()
  }
}
