import { AbstractView } from "./AbstractView"
import { Toast } from "../components/Toast"

export class Register extends AbstractView {
  constructor(params) {
    super(params)
    this.setTitle("Register")
  }

  async getHtml() {
    return `
      <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          <form id="register-form" class="mt-8 space-y-6">
            <div class="rounded-md shadow-sm space-y-4">
              <div>
                <label for="email" class="label">Email address</label>
                <input id="email" name="email" type="email" required class="rounded-xl input">
              </div>
              <div>
                <label for="password" class="label">Password</label>
                <input id="password" name="password" type="password" required class="input rounded-xl">
              </div>
              <div>
                <label for="role" class="label">Role</label>
                <select id="role" name="role" class="input rounded-xl" required>
                  <option value="">Select a role</option>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>
              
              <!-- Student Fields -->
              <div id="student-fields" class="hidden space-y-4">
                <div>
                  <label for="name" class="label">Full Name</label>
                  <input id="name" name="name" type="text" class="rounded-xl input">
                </div>
                <div>
                  <label for="rollNo" class="label">Roll Number</label>
                  <input id="rollNo" name="rollNo" type="text" class="rounded-xl input">
                </div>
                <div>
                  <label for="phoneNumber" class="label">Phone Number</label>
                  <input id="phoneNumber" name="phoneNumber" type="text" class="rounded-xl input">
                </div>
                <div>
                  <label for="branchName" class="label">Branch Name</label>
                  <input id="branchName" name="branchName" type="text" class="rounded-xl input">
                </div>
                <div>
                  <label for="semester" class="label">Semester</label>
                  <input id="semester" name="semester" type="number" min="1" max="8" class="input rounded-xl">
                </div>
              </div>
              
              <!-- Teacher Fields -->
              <div id="teacher-fields" class="hidden space-y-4">
                <div>
                  <label for="teacherName" class="label">Full Name</label>
                  <input id="teacherName" name="teacherName" type="text" class="rounded-xl input">
                </div>
                <div>
                  <label for="department" class="label">Department</label>
                  <input id="department" name="department" type="text" class="rounded-xl input">
                </div>
              </div>
            </div>
            
            <div id="error-message" class="text-red-500 text-center hidden"></div>
            
            <div>
              <button type="submit" class="rounded-xl btn btn-primary w-full">
                Register
              </button>
            </div>
            
            <div class="text-center">
              <p class="text-sm text-gray-600">
                Already have an account?
                <a href="/login" data-link class="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    `
  }

  afterRender() {
    const form = document.getElementById("register-form")
    const roleSelect = document.getElementById("role")
    const studentFields = document.getElementById("student-fields")
    const teacherFields = document.getElementById("teacher-fields")
    const errorMessage = document.getElementById("error-message")

    roleSelect.addEventListener("change", () => {
      if (roleSelect.value === "STUDENT") {
        studentFields.classList.remove("hidden")
        teacherFields.classList.add("hidden")
      } else if (roleSelect.value === "TEACHER") {
        teacherFields.classList.remove("hidden")
        studentFields.classList.add("hidden")
      } else {
        studentFields.classList.add("hidden")
        teacherFields.classList.add("hidden")
      }
    })

    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value
      const password = document.getElementById("password").value
      const role = roleSelect.value

      if (!role) {
        errorMessage.textContent = "Please select a role"
        errorMessage.classList.remove("hidden")
        return
      }

      const userData = { email, password, role }

      if (role === "STUDENT") {
        userData.name = document.getElementById("name").value
        userData.rollNo = document.getElementById("rollNo").value
        userData.phoneNumber = document.getElementById("phoneNumber").value
        userData.branchName = document.getElementById("branchName").value
        userData.semester = Number.parseInt(document.getElementById("semester").value)
      } else if (role === "TEACHER") {
        userData.name = document.getElementById("teacherName").value
        userData.department = document.getElementById("department").value
      }

      try {
        errorMessage.classList.add("hidden")
        const response = await window.auth.register(userData)

        if (response.success) {
          Toast.show("Registration successful!")
          window.navigateTo("/")
        }
      } catch (error) {
        errorMessage.textContent = error.message || "Registration failed"
        errorMessage.classList.remove("hidden")
      }
    })
  } 
}
