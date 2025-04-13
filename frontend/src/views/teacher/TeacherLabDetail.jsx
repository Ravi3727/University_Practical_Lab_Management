import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { Loader } from "../../components/Loader"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class TeacherLabDetail extends AbstractView {
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
      const user = window.auth.getUser()
      const teacherId = user.teacher.id

      // Fetch lab details
      const response = await ApiService.get(`/teachers/${teacherId}/labs`)
      const labs = response.data
      this.lab = labs.find((lab) => lab.id === this.labId)

      if (!this.lab) {
        throw new Error("Lab not found")
      }

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
          <a href="/teacher/labs" data-link class="btn btn-primary mt-4">Back to My Labs</a>
        </div>
      `
      return
    }

    labContainer.innerHTML = `
      <div class="mb-6">
        <a href="/teacher/labs" data-link class="text-primary-600 hover:text-primary-800">
          &larr; Back to My Labs
        </a>
      </div>
      
      <div class="card rounded-xl mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">${this.lab.subjectName}</h1>
            <p class="text-gray-500">Code: ${this.lab.subjectCode}</p>
          </div>
          <div class="flex space-x-2">
            <a href="/teacher/labs/${this.lab.id}/students" data-link class="btn btn-secondary rounded-xl">View Students</a>
            <a href="/teacher/labs/${this.lab.id}/practicals" data-link class="btn btn-secondary rounded-xl">Manage Practicals</a>
            <button id="edit-lab-btn" class="btn btn-primary rounded-xl">Edit Lab</button>
          </div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Syllabus</h2>
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="whitespace-pre-line">${this.lab.syllabus}</p>
          </div>
        </div>
        
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="text-sm text-gray-500">Attendance Marks</p>
            <p class="text-2xl font-bold text-gray-900">${this.lab.attendanceMarks}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="text-sm text-gray-500">Practical Marks</p>
            <p class="text-2xl font-bold text-gray-900">${this.lab.practicalMarks}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="text-sm text-gray-500">Viva Marks</p>
            <p class="text-2xl font-bold text-gray-900">${this.lab.vivaMarks}</p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card rounded-xl">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Timetable</h2>
            <button id="add-timetable-btn" class="rounded-xl btn btn-primary text-sm">Add Timetable</button>
          </div>
          
          ${
            this.lab.timetables.length === 0
              ? `
            <p class="text-gray-500">No timetable entries available.</p>
          `
              : `
            <div class="overflow-x-auto rounded-xl">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button class="text-primary-600 hover:text-primary-800 mr-2 edit-timetable-btn" data-timetable-id="${timetable.id}">Edit</button>
                        <button class="text-red-600 hover:text-red-800 delete-timetable-btn" data-timetable-id="${timetable.id}">Delete</button>
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
        
        <div class="card rounded-xl">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Notices</h2>
            <button id="add-notice-btn" class="rounded-xl btn btn-primary text-sm">Add Notice</button>
          </div>
          
          ${
            this.lab.notices.length === 0
              ? `
            <p class="text-gray-500">No notices available.</p>
          `
              : `
            <div class="space-y-4 rounded-xl">
              ${this.lab.notices
                .map(
                  (notice) => `
                <div class="border border-gray-200 rounded-xl p-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-medium text-gray-900">${notice.title}</h3>
                      <p class="text-sm text-gray-500 mb-2">Posted on ${new Date(notice.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <button class="text-primary-600 hover:text-primary-800 mr-2 edit-notice-btn" data-notice-id="${notice.id}">Edit</button>
                      <button class="text-red-600 hover:text-red-800 delete-notice-btn" data-notice-id="${notice.id}">Delete</button>
                    </div>
                  </div>
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
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Practicals</h2>
          <button id="add-practical-btn" class="rounded-xl btn btn-primary text-sm">Add Practical</button>
        </div>
        
        ${
          this.lab.practicals.length === 0
            ? `
          <p class="text-gray-500">No practicals assigned yet.</p>
        `
            : `
          <div class="overflow-x-auto rounded-xl">
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
                ${this.lab.practicals
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

    // Edit lab button
    document.getElementById("edit-lab-btn").addEventListener("click", () => {
      this.showEditLabModal()
    })

    // Add timetable button
    document.getElementById("add-timetable-btn").addEventListener("click", () => {
      this.showTimetableModal()
    })

    // Edit timetable buttons
    document.querySelectorAll(".edit-timetable-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const timetableId = e.target.dataset.timetableId
        const timetable = this.lab.timetables.find((t) => t.id === timetableId)
        if (timetable) {
          this.showTimetableModal(timetable)
        }
      })
    })

    // Delete timetable buttons
    document.querySelectorAll(".delete-timetable-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const timetableId = e.target.dataset.timetableId
        if (confirm("Are you sure you want to delete this timetable entry?")) {
          try {
            await ApiService.delete(`/teachers/${teacherId}/timetable/${timetableId}`)
            Toast.show("Timetable entry deleted successfully")
            this.fetchLabDetails()
          } catch (error) {
            Toast.show(error.message || "Failed to delete timetable entry", "error")
          }
        }
      })
    })

    // Add notice button
    document.getElementById("add-notice-btn").addEventListener("click", () => {
      this.showNoticeModal()
    })

    // Edit notice buttons
    document.querySelectorAll(".edit-notice-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const noticeId = e.target.dataset.noticeId
        const notice = this.lab.notices.find((n) => n.id === noticeId)
        if (notice) {
          this.showNoticeModal(notice)
        }
      })
    })

    // Delete notice buttons
    document.querySelectorAll(".delete-notice-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const noticeId = e.target.dataset.noticeId
        if (confirm("Are you sure you want to delete this notice?")) {
          try {
            await ApiService.delete(`/teachers/${teacherId}/notices/${noticeId}`)
            Toast.show("Notice deleted successfully")
            this.fetchLabDetails()
          } catch (error) {
            Toast.show(error.message || "Failed to delete notice", "error")
          }
        }
      })
    })

    // Add practical button
    document.getElementById("add-practical-btn").addEventListener("click", () => {
      this.showPracticalModal()
    })

    // Edit practical buttons
    document.querySelectorAll(".edit-practical-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const practicalId = e.target.dataset.practicalId
        const practical = this.lab.practicals.find((p) => p.id === practicalId)
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
            this.fetchLabDetails()
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

  showEditLabModal() {
    const user = window.auth.getUser()
    const teacherId = user.teacher.id

    // Create modal
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    modal.id = "edit-lab-modal"

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">Edit Lab</h2>
            <button id="close-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form id="edit-lab-form" class="mt-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="subjectName" class="label">Subject Name</label>
                <input type="text" id="subjectName" name="subjectName" class="input" value="${this.lab.subjectName}" required>
              </div>
              
              <div class="form-group">
                <label for="subjectCode" class="label">Subject Code</label>
                <input type="text" id="subjectCode" name="subjectCode" class="input" value="${this.lab.subjectCode}" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="syllabus" class="label">Syllabus</label>
              <textarea id="syllabus" name="syllabus" rows="6" class="input" required>${this.lab.syllabus}</textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="form-group">
                <label for="attendanceMarks" class="label">Attendance Marks</label>
                <input type="number" id="attendanceMarks" name="attendanceMarks" class="input" value="${this.lab.attendanceMarks}" min="0" max="100" required>
              </div>
              
              <div class="form-group">
                <label for="practicalMarks" class="label">Practical Marks</label>
                <input type="number" id="practicalMarks" name="practicalMarks" class="input rounded-xl" value="${this.lab.practicalMarks}" min="0" max="100" required>
              </div>
              
              <div class="form-group">
                <label for="vivaMarks" class="label">Viva Marks</label>
                <input type="number" id="vivaMarks" name="vivaMarks" class="rounded-xl input" value="${this.lab.vivaMarks}" min="0" max="100" required>
              </div>
            </div>
            
            <div id="error-message" class="text-red-500 text-center hidden"></div>
            
            <div class="flex justify-end">
              <button type="submit" class="roundedl-xl btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listeners
    document.getElementById("close-modal").addEventListener("click", () => {
      document.getElementById("edit-lab-modal").remove()
    })

    document.getElementById("edit-lab-form").addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = {
        subjectName: document.getElementById("subjectName").value,
        subjectCode: document.getElementById("subjectCode").value,
        syllabus: document.getElementById("syllabus").value,
        attendanceMarks: Number.parseInt(document.getElementById("attendanceMarks").value),
        practicalMarks: Number.parseInt(document.getElementById("practicalMarks").value),
        vivaMarks: Number.parseInt(document.getElementById("vivaMarks").value),
      }

      try {
        const errorMessage = document.getElementById("error-message")
        errorMessage.classList.add("hidden")

        await ApiService.put(`/teachers/${teacherId}/labs/${this.labId}`, formData)

        Toast.show("Lab updated successfully")
        document.getElementById("edit-lab-modal").remove()
        this.fetchLabDetails()
      } catch (error) {
        const errorMessage = document.getElementById("error-message")
        errorMessage.textContent = error.message || "Failed to update lab"
        errorMessage.classList.remove("hidden")
      }
    })
  }

  showTimetableModal(timetable = null) {
    const user = window.auth.getUser()
    const teacherId = user.teacher.id
    const isEditing = !!timetable

    // Create modal
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    modal.id = "timetable-modal"

    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">${isEditing ? "Edit" : "Add"} Timetable Entry</h2>
            <button id="close-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form id="timetable-form" class=" mt-6 space-y-6">
            <div class="form-group">
              <label for="day" class="label">Day</label>
              <select id="day" name="day" class="input" required>
                <option value="">Select a day</option>
                <option value="Monday" ${timetable && timetable.day === "Monday" ? "selected" : ""}>Monday</option>
                <option value="Tuesday" ${timetable && timetable.day === "Tuesday" ? "selected" : ""}>Tuesday</option>
                <option value="Wednesday" ${timetable && timetable.day === "Wednesday" ? "selected" : ""}>Wednesday</option>
                <option value="Thursday" ${timetable && timetable.day === "Thursday" ? "selected" : ""}>Thursday</option>
                <option value="Friday" ${timetable && timetable.day === "Friday" ? "selected" : ""}>Friday</option>
                <option value="Saturday" ${timetable && timetable.day === "Saturday" ? "selected" : ""}>Saturday</option>
                <option value="Sunday" ${timetable && timetable.day === "Sunday" ? "selected" : ""}>Sunday</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label for="startTime" class="label">Start Time</label>
                <input type="time" id="startTime" name="startTime" class="input" value="${timetable ? timetable.startTime : ""}" required>
              </div>
              
              <div class="form-group">
                <label for="endTime" class="label">End Time</label>
                <input type="time" id="endTime" name="endTime" class="input" value="${timetable ? timetable.endTime : ""}" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="room" class="label">Room</label>
              <input type="text" id="room" name="room" class="input" value="${timetable ? timetable.room : ""}" required>
            </div>
            
            <div id="error-message" class="text-red-500 text-center hidden"></div>
            
            <div class="flex justify-end rounded-xl">
              <button type="submit" class="btn btn-primary">${isEditing ? "Save Changes" : "Add Timetable"}</button>
            </div>
          </form>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listeners
    document.getElementById("close-modal").addEventListener("click", () => {
      document.getElementById("timetable-modal").remove()
    })

    document.getElementById("timetable-form").addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = {
        day: document.getElementById("day").value,
        startTime: document.getElementById("startTime").value,
        endTime: document.getElementById("endTime").value,
        room: document.getElementById("room").value,
      }

      try {
        const errorMessage = document.getElementById("error-message")
        errorMessage.classList.add("hidden")

        if (isEditing) {
          await ApiService.put(`/teachers/${teacherId}/timetable/${timetable.id}`, formData)
          Toast.show("Timetable entry updated successfully")
        } else {
          await ApiService.post(`/teachers/${teacherId}/labs/${this.labId}/timetable`, formData)
          Toast.show("Timetable entry added successfully")
        }

        document.getElementById("timetable-modal").remove()
        this.fetchLabDetails()
      } catch (error) {
        const errorMessage = document.getElementById("error-message")
        errorMessage.textContent = error.message || "Failed to save timetable entry"
        errorMessage.classList.remove("hidden")
      }
    })
  }

  showNoticeModal(notice = null) {
    const user = window.auth.getUser()
    const teacherId = user.teacher.id
    const isEditing = !!notice

    // Create modal
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    modal.id = "notice-modal"

    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">${isEditing ? "Edit" : "Add"} Notice</h2>
            <button id="close-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form id="notice-form" class="mt-6 space-y-6">
            <div class="form-group">
              <label for="title" class="label">Title</label>
              <input type="text" id="title" name="title" class="input" value="${notice ? notice.title : ""}" required>
            </div>
            
            <div class="form-group">
              <label for="content" class="label">Content</label>
              <textarea id="content" name="content" rows="6" class="input" required>${notice ? notice.content : ""}</textarea>
            </div>
            
            <div id="error-message" class="text-red-500 text-center hidden"></div>
            
            <div class="flex justify-end">
              <button type="submit" class="btn btn-primary">${isEditing ? "Save Changes" : "Add Notice"}</button>
            </div>
          </form>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listeners
    document.getElementById("close-modal").addEventListener("click", () => {
      document.getElementById("notice-modal").remove()
    })

    document.getElementById("notice-form").addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = {
        title: document.getElementById("title").value,
        content: document.getElementById("content").value,
      }

      try {
        const errorMessage = document.getElementById("error-message")
        errorMessage.classList.add("hidden")

        if (isEditing) {
          await ApiService.put(`/teachers/${teacherId}/notices/${notice.id}`, formData)
          Toast.show("Notice updated successfully")
        } else {
          await ApiService.post(`/teachers/${teacherId}/labs/${this.labId}/notices`, formData)
          Toast.show("Notice added successfully")
        }

        document.getElementById("notice-modal").remove()
        this.fetchLabDetails()
      } catch (error) {
        const errorMessage = document.getElementById("error-message")
        errorMessage.textContent = error.message || "Failed to save notice"
        errorMessage.classList.remove("hidden")
      }
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
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
        this.fetchLabDetails()
      } catch (error) {
        const errorMessage = document.getElementById("error-message")
        errorMessage.textContent = error.message || "Failed to save practical"
        errorMessage.classList.remove("hidden")
      }
    })
  }

  async showSubmissionsModal(practicalId) {
    const practical = this.lab.practicals.find((p) => p.id === practicalId)
    if (!practical) return

    // Create modal
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    modal.id = "submissions-modal"

    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

      // console.log("Submissions:", submissions)
      // Render submissions
      const submissionsContainer = document.getElementById("submissions-container")

      if (submissions.length === 0) {
        submissionsContainer.innerHTML = `
          <div class="text-center py-8 rounded-xl">
            <p class="text-gray-500">No students enrolled in this lab.</p>
          </div>
        `
      } else {
        submissionsContainer.innerHTML = `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y  divide-gray-200">
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
                          ? `<button class="btn rounded-xl btn-primary text-xs grade-btn" data-submission-id="${submission.id}">
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
    modal.className = "fixed rounded-xl inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    modal.id = "grade-modal"

    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">Grade Submission</h2>
            <button id="close-modalgrade" class="text-gray-400 hover:text-gray-500">
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
            <div class="form-group rounded-xl">
              <label for="practicalMark" class="label">Practical Marks (out of ${this.lab.practicalMarks})</label>
              <input type="number" id="practicalMark" name="practicalMark" class="rounded-xl input" 
                value="${submission.marks ? submission.marks.practicalMark : ""}" 
                min="0" max="${this.lab.practicalMarks}" step="0.5" required>
            </div>
            
            <div class="form-group">
              <label for="vivaMark" class="label">Viva Marks (out of ${this.lab.vivaMarks})</label>
              <input type="number" id="vivaMark" name="vivaMark" class="rounded-xl input" 
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
    document.getElementById("close-modalgrade").addEventListener("click", () => {
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

    this.fetchLabDetails()
  }
}
