export class Toast {
    static show(message, type = "success", duration = 3000) {
      // Remove existing toasts
      const existingToast = document.querySelector(".toast")
      if (existingToast) {
        existingToast.remove()
      }
  
      // Create toast element
      const toast = document.createElement("div")
      toast.className = `toast fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white`
      toast.textContent = message
  
      // Add to DOM
      document.body.appendChild(toast)
  
      // Remove after duration
      setTimeout(() => {
        toast.classList.add("opacity-0", "transition-opacity", "duration-300")
        setTimeout(() => toast.remove(), 300)
      }, duration)
    }
  }
  