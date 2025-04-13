import { AbstractView } from "./AbstractView"
import { Toast } from "../components/Toast"

export class Login extends AbstractView {
  constructor(params) {
    super(params)
    this.setTitle("Login")
  }

  async getHtml() {
    return `
      <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form id="login-form" class="mt-8 space-y-6">
            <div class="rounded-md shadow-sm -space-y-px">
              <div>
                <label for="email" class="sr-only">Email address</label>
                <input id="email" name="email" type="email" required class="input rounded-t-xl" placeholder="Email address">
              </div>
              <div>
                <label for="password" class="sr-only">Password</label>
                <input id="password" name="password" type="password" required class="input rounded-b-xl" placeholder="Password">
              </div>
            </div>
            
            <div id="error-message" class="text-red-500 text-center hidden"></div>
            
            <div>
              <button type="submit" class="rounded-xl btn btn-primary w-full">
                Sign in
              </button>
            </div>
            
            <div class="text-center">
              <p class="text-sm text-gray-600">
                Don't have an account?
                <a href="/register" data-link class="font-medium text-primary-600 hover:text-primary-500">
                  Register here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    `
  }

  afterRender() {
    const form = document.getElementById("login-form")
    const errorMessage = document.getElementById("error-message")

    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      try {
        errorMessage.classList.add("hidden")
        const response = await window.auth.login(email, password)

        if (response.success) {
          Toast.show("Login successful!")
          window.navigateTo("/")
        }
      } catch (error) {
        errorMessage.textContent = error.message || "Invalid credentials"
        errorMessage.classList.remove("hidden")
      }
    })
  } 
}
