import "./index.css"
import { router } from "./router"
import { AuthService } from "./services/AuthService"

// Initialize the app
const app = document.getElementById("app")

// Handle navigation
function navigateTo(url) {
  history.pushState(null, null, url)
  router.route()
}

// Set up navigation event listeners
window.addEventListener("popstate", router.route)
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault()
      navigateTo(e.target.href)
    }
  })

  // Initial route
  router.route()
})

// Export for global access
window.navigateTo = navigateTo
window.auth = new AuthService()
