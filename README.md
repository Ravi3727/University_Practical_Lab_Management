# 🧪 University Practical Lab Management System

A complete web application to simplify how practical labs are managed in universities!  
This system allows **students** to enroll in labs, track their attendance, check marks, view practicals, and submit work — all in one place.  
Meanwhile, **teachers** can create labs, assign practicals, review submissions, mark attendance, and assign grades with ease.

---

## ✨ Features

### 👨‍🎓 For Students:
- 🔑 Secure login/signup
- 📚 Enroll in available labs
- 📄 View and download assigned practicals
- ✅ Submit completed practicals
- 🎯 Check marks and feedback
- 📆 Track attendance per lab

### 👩‍🏫 For Teachers:
- 🔐 Secure teacher authentication
- 🧪 Create and manage labs
- 📝 Upload new practicals
- 📥 View student submissions
- 🗳️ Give marks and feedback
- 🗓️ Mark student attendance

---

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TailwindCSS  
- **Backend**: Node.js + Express.js  
- **Database**: MySQL  

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Ravi3727/University_Practical_Lab_Management.git 
cd University_Practical_Lab_Management 

### 2. Setup Backend  
```bash 
cd backend 
npm install 

#### Create a .env file inside the backend folder with the following: 
```bash 
PORT=5000 
DB_HOST=your_mysql_host 
DB_USER=your_mysql_username 
DB_PASSWORD=your_mysql_password 
DB_NAME=your_database_name 
JWT_SECRET=your_jwt_secret 

#### Start the backend server: 
```bash 
npm run dev 


### 3. Setup Frontend 
```bash 
cd ../frontend 
npm install 
npm run dev 


## ✅ Usage 
Visit the frontend in your browser at http://localhost:5173 

Make sure the backend is running on http://localhost:5000 

Login or register as a student or teacher to explore the full functionality. 


## 📌 Notes 
This project uses JWT authentication for secure login. 

Student and Teacher dashboards are separated based on user roles. 

MySQL database must be properly configured with required tables (you can include a SQL dump or schema file in the repo). 


## 🙌 Contributions 
Feel free to open issues or contribute improvements. Pull requests are welcome! 


## 📧 Contact 
For any queries or feedback, feel free to reach out at: 
[ravikantdtu@gmail.com] 




