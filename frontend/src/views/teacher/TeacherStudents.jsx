import { AbstractView } from "../AbstractView"
import { Navbar } from "../../components/Navbar"
import { Loader } from "../../components/Loader"
import { ApiService } from "../../services/ApiService"
import { Toast } from "../../components/Toast"

export class TeacherStudents extends AbstractView {
  constructor(params) {
    super(params)
    this.labId = params.id
    this.lab = null
    this.students = []
    this.isLoading = true
    this.setTitle('Lab Students')
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
        
        <div id="students-container">
          ${Loader()}
        </div>
      </div>
    `
  }
  
  async fetchStudents() {
    try {
      // Fetch lab details
      const labResponse = await ApiService.get(`/labs/${this.labId}`)
      this.lab = labResponse.data
      console.log(this.lab)
      // Fetch students
    const user = window.auth.getUser()
    const teacherId = user.teacher.id
      console.log(teacherId)
      
      const studentsResponse = await ApiService.get(`/teachers/${teacherId}/labs/${this.labId}/students`)
      this.students = studentsResponse.data
    console.log(studentsResponse.data)
      this.renderStudents()
    } catch (error) {
      Toast.show(error.message || 'Failed to fetch students', 'error')
    } finally {
      this.isLoading = false
    }
  }
  
  renderStudents() {
    const studentsContainer = document.getElementById('students-container')
    
    if (!this.lab) {
      studentsContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-500">Lab not found</p>
        </div>
      `
      return
    }
    
    studentsContainer.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Students - ${this.lab.subjectName}</h1>
        <button id="mark-attendance-btn" class="rounded-xl btn btn-primary">Mark Attendance</button>
      </div>
      
      <div class="card">
        ${this.students.length === 0 ? `
          <div class="text-center py-8">
            <p class="text-gray-500">No students enrolled in this lab.</p>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${this.students.map(student => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.rollNo}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.branchName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.semester}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button class="text-primary-600 hover:text-primary-800 mr-2 view-attendance-btn" data-student-id="${student.id}">View Attendance</button>
                      <button class="text-primary-600 hover:text-primary-800 view-marks-btn" data-student-id="${student.id}">View Marks</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `
    
    // Add event listeners
    if (this.students.length > 0) {
      document.getElementById('mark-attendance-btn').addEventListener('click', () => {
        this.showAttendanceModal()
      })
      
      document.querySelectorAll('.view-attendance-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const studentId = e.target.dataset.studentId
          this.showStudentAttendanceModal(studentId)
        })
      })
      
      document.querySelectorAll('.view-marks-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const studentId = e.target.dataset.studentId
          this.showStudentMarksModal(studentId)
        })
      })
    }
  }
  
  showAttendanceModal() {
    const user = window.auth.getUser()
    const teacherId = user.teacher.id
    
    // Create modal
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'
    modal.id = 'attendance-modal'
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">Mark Attendance</h2>
            <button id="close-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form id="attendance-form" class="mt-6">
            <div class="form-group mb-6">
              <label for="date" class="label">Date</label>
              <input type="date" id="date" name="date" class="rounded-xl input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  ${this.students.map(student => `
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.name}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.rollNo}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="flex items-center">
                          <input type="checkbox" id="attendance-${student.id}" name="attendance-${student.id}" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                          <label for="attendance-${student.id}" class="ml-2 block text-sm text-gray-900">Present</label>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div id="error-message" class="text-red-500 text-center hidden mt-4"></div>
            
            <div class="flex justify-end mt-6">
              <button type="submit" class="rounded-xl  btn btn-primary">Save Attendance</button>
            </div>
          </form>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Add event listeners
    document.getElementById('close-modal').addEventListener('click', () => {
      document.getElementById('attendance-modal').remove()
    })
    
    document.getElementById('attendance-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const date = document.getElementById('date').value
      const errorMessage = document.getElementById('error-message')
      errorMessage.classList.add('hidden')
      
      try {
        // Mark attendance for each student
        for (const student of this.students) {
          const isPresent = document.getElementById(`attendance-${student.id}`).checked
          
          await ApiService.post(`/teachers/${teacherId}/labs/${this.labId}/attendance`, {
            studentId: student.id,
            date,
            isPresent
          })
        }
        
        Toast.show('Attendance marked successfully')
        document.getElementById('attendance-modal').remove()
      } catch (error) {
        errorMessage.textContent = error.message || 'Failed to mark attendance'
        errorMessage.classList.remove('hidden')
      }
    })
  }
  
  async showStudentAttendanceModal(studentId) {
    const student = this.students.find(s => s.id === studentId)
    if (!student) return
    
    // Create modal
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'
    modal.id = 'student-attendance-modal'
    
    modal.innerHTML = `
     <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-bold text-gray-900">Attendance - ${student.name}</h2>
            <button id="close-attendance-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div id="student-attendance-data" class="mt-6">
            ${Loader()}
          </div>
        </div>
      </div> `
      document.body.appendChild(modal)

      document.getElementById('close-attendance-modal').addEventListener('click', () => {
        document.getElementById('student-attendance-modal').remove()
      })
  
      try {

        const response = await ApiService.get(`/students/${studentId}/attendance/${this.labId}`)
        const attendanceRecords = response.data
  
        const attendanceHtml = `
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${attendanceRecords.map(record => `
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">${record.date}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    ${record.isPresent ? 'Present' : 'Absent'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
  
        document.getElementById('student-attendance-data').innerHTML = attendanceHtml
      } catch (error) {
        document.getElementById('student-attendance-data').innerHTML = `
          <p class="text-red-500 text-center mt-4">${error.message || 'Failed to fetch attendance data'}</p>
        `
      }
    }

    async showStudentMarksModal(studentId) {
        const student = this.students.find(s => s.id === studentId)
        if (!student) return
    
        const modal = document.createElement('div')
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'
        modal.id = 'student-marks-modal'
    
        modal.innerHTML = `
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-start">
                <h2 class="text-xl font-bold text-gray-900">Marks - ${student.name}</h2>
                <button id="close-marks-modal" class="text-gray-400 hover:text-gray-500">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
    
              <div id="student-marks-data" class="mt-6">
                ${Loader()}
              </div>
            </div>
          </div>
        `
    
        document.body.appendChild(modal)
    
        document.getElementById('close-marks-modal').addEventListener('click', () => {
          document.getElementById('student-marks-modal').remove()
        })
    
        try {
          const response = await ApiService.get(`/students/${studentId}/marks/${this.labId}`)
          const marks = response.data
    
          const marksHtml = `
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${(Array.isArray(marks) ? marks : Object.values(marks ?? {}))
                .filter(entry => entry && typeof entry === 'object' && 'assessmentName' in entry && 'marks' in entry)
                ?.map(entry => `
                  <tr>
                    <td class="px-6 py-4 text-sm text-gray-900">${entry.assessmentName}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${entry.marks}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
    
          document.getElementById('student-marks-data').innerHTML = marksHtml
        } catch (error) {
          document.getElementById('student-marks-data').innerHTML = `
            <p class="text-red-500 text-center mt-4">${error.message || 'Failed to fetch marks data'}</p>
          `
        }
      }
    
      afterRender() {
        const logoutBtn = document.getElementById("logout-btn")
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            window.auth.logout()
          })
        }
    
        this.fetchStudents()
      }
    }
