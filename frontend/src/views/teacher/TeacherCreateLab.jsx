import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class TeacherCreateLab extends AbstractView {
  constructor(params) {
    super(params)
    this.setTitle("Create Lab")
  }

  async getHtml() {
    return `
      ${Navbar()}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
          <a href="/teacher/labs" data-link class="text-primary-600 hover:text-primary-800">
            &larr; Back to My Labs
          </a>
        </div>
        
        <div class="card rounded-xl">
          <h1 class="text-2xl font-bold text-gray-900 mb-6">Create New Lab</h1>
          
          <form id="create-lab-form" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="subjectName" class="label">Subject Name</label>
                <input type="text" id="subjectName" name="subjectName" class="rounded-xl input" required>
              </div>
              
              <div class="form-group">
                <label for="subjectCode" class="label">Subject Code</label>
                <input type="text" id="subjectCode" name="subjectCode" class="rounded-xl input" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="syllabus" class="label">Syllabus</label>
              <textarea id="syllabus" name="syllabus" rows="6" class="rounded-xl input" required></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="form-group">
                <label for="attendanceMarks" class="label">Attendance Marks</label>
                <input type="number" id="attendanceMarks" name="attendanceMarks" class="input rounded-xl" value="10" min="0" max="100" required>
              </div>
              
              <div class="form-group">
                <label for="practicalMarks" class="label">Practical Marks</label>
                <input type="number" id="practicalMarks" name=" practicalMarks" class="input rounded-xl" value="60" min="0" max="100" required>
              </div>
              
              <div class="form-group">
                <label for="vivaMarks" class="label">Viva Marks</label>
                <input type="number" id="vivaMarks" name="vivaMarks" class="rounded-xl input" value="30" min="0" max="100" required>
              </div>
            </div>
            
            <div id="error-message" class="text-red-500 text-center hidden"></div>
            
            <div class="flex justify-end">
              <button type="submit" class="rounded-xl  btn btn-primary">Create Lab</button>
            </div>
          </form>
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

    const form = document.getElementById("create-lab-form")
    const errorMessage = document.getElementById("error-message")

    form.addEventListener("submit", async (e) => {
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
        errorMessage.classList.add("hidden")
        const user = window.auth.getUser()
        const teacherId = user.teacher.id

        await ApiService.post(`/teachers/${teacherId}/labs`, formData)

        Toast.show("Lab created successfully")
        window.navigateTo("/teacher/labs")
      } catch (error) {
        errorMessage.textContent = error.message || "Failed to create lab"
        errorMessage.classList.remove("hidden")
      }
    })
  }
}
