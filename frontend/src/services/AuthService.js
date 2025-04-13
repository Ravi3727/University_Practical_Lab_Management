import { ApiService } from "./ApiService"

export class AuthService {
  constructor() {
    this.token = localStorage.getItem("token")
    this.user = JSON.parse(localStorage.getItem("user") || "null")
  }

  async login(email, password) {
    try {
      const response = await ApiService.post("/auth/login", { email, password })

      if (response.success) {
        this.token = response.token
        this.user = response.user

        localStorage.setItem("token", this.token)
        localStorage.setItem("user", JSON.stringify(this.user))

        return response
      }
    } catch (error) {
      throw error
    }
  }

  async register(userData) {
    try {
      const response = await ApiService.post("/auth/register", userData)

      if (response.success) {
        this.token = response.token
        this.user = response.user

        localStorage.setItem("token", this.token)
        localStorage.setItem("user", JSON.stringify(this.user))

        return response
      }
    } catch (error) {
      throw error
    }
  }

  async getCurrentUser() {
    try {
      if (!this.token) return null

      const response = await ApiService.get("/auth/me")

      if (response.success) {
        this.user = response.data
        localStorage.setItem("user", JSON.stringify(this.user))
        return this.user
      }
    } catch (error) {
      this.logout()
      throw error
    }
  }

  logout() {
    this.token = null
    this.user = null

    localStorage.removeItem("token")
    localStorage.removeItem("user")

    window.navigateTo("/login")
  }

  isAuthenticated() {
    return !!this.token
  }

  getUser() {
    return this.user
  }

  hasRole(role) {
    return this.user && this.user.role === role
  }
}
