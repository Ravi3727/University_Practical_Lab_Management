export function Navbar() {
    const user = JSON.parse(localStorage.getItem("user") || "null")
  
    if (!user) return ""
  
    const isStudent = user.role === "STUDENT"
    const isTeacher = user.role === "TEACHER"
  
    return `
      <nav class="bg-primary-700 rounded-b-xl text-white shadow-xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <a href="/" data-link class="text-xl font-bold">Lab Management</a>
              </div>
              <div class="ml-6 flex space-x-4 items-center">
                <a href="/" data-link class="px-3 py-2 rounded-xl text-sm font-medium hover:bg-primary-600">Dashboard</a>
                ${
                  isStudent
                    ? `
                  <a href="/student/labs" data-link class="px-3 py-2 rounded-xl text-sm font-medium hover:bg-primary-600">My Labs</a>
                  <a href="/student/submissions" data-link class="px-3 py-2 rounded-xl text-sm font-medium hover:bg-primary-600">Submissions</a>
                `
                    : ""
                }
                ${
                  isTeacher
                    ? `
                  <a href="/teacher/labs" data-link class="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600">My Labs</a>
                  <a href="/teacher/create-lab" data-link class="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600">Create Lab</a>
                `
                    : ""
                }
              </div>
            </div>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                ${
                  isStudent
                    ? `<span class="mr-4">Welcome! ${user.student?.name}</span>`
                    : `<span class="mr-4">Welcome! ${user.teacher?.name}</span>`
                }
              
                <button id="logout-btn" class="rounded-xl btn btn-secondary">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    `
  }
  