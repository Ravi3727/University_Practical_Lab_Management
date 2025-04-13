const API_URL = "http://localhost:5000/api"

export class ApiService {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem("token")

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const config = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config)
      const data = await response.json()
        // console.log("API Response:", data)
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  static get(endpoint) {
    return this.request(endpoint, { method: "GET" })
  }

  static post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  static put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }
}
