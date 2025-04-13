-- Drop tables if they exist (in reverse order of creation to avoid foreign key constraints)
DROP TABLE IF EXISTS notice;
DROP TABLE IF EXISTS mark;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS submission;
DROP TABLE IF EXISTS practical;
DROP TABLE IF EXISTS timetable;
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS lab;
DROP TABLE IF EXISTS teacher;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS user;

-- Create users table
CREATE TABLE user (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'TEACHER', 'ADMIN') DEFAULT 'STUDENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE student (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  roll_no VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  semester INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Create teachers table
CREATE TABLE teacher (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Create labs table
CREATE TABLE lab (
  id VARCHAR(36) PRIMARY KEY,
  subject_name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(255) NOT NULL UNIQUE,
  syllabus TEXT NOT NULL,
  attendance_marks INT DEFAULT 10,
  practical_marks INT DEFAULT 60,
  viva_marks INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  teacher_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE
);

-- Create enrollments table
CREATE TABLE enrollment (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  student_id VARCHAR(36) NOT NULL,
  lab_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  FOREIGN KEY (lab_id) REFERENCES lab(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, lab_id)
);

-- Create timetables table
CREATE TABLE timetable (
  id VARCHAR(36) PRIMARY KEY,
  day VARCHAR(20) NOT NULL,
  start_time VARCHAR(20) NOT NULL,
  end_time VARCHAR(20) NOT NULL,
  room VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lab_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (lab_id) REFERENCES lab(id) ON DELETE CASCADE
);

-- Create practicals table
CREATE TABLE practical (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  deadline DATETIME NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lab_id VARCHAR(36) NOT NULL,
  teacher_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (lab_id) REFERENCES lab(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE
);

-- Create submissions table
CREATE TABLE submission (
  id VARCHAR(36) PRIMARY KEY,
  file_url TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  practical_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (practical_id) REFERENCES practical(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  UNIQUE KEY unique_submission (student_id, practical_id)
);

-- Create attendances table
CREATE TABLE attendance (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  is_present BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  student_id VARCHAR(36) NOT NULL,
  lab_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  FOREIGN KEY (lab_id) REFERENCES lab(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (student_id, lab_id, date)
);

-- Create marks table
CREATE TABLE mark (
  id VARCHAR(36) PRIMARY KEY,
  attendance_mark FLOAT DEFAULT 0,
  practical_mark FLOAT DEFAULT 0,
  viva_mark FLOAT DEFAULT 0,
  total_mark FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  student_id VARCHAR(36) NOT NULL,
  submission_id VARCHAR(36) UNIQUE NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE
);

-- Create notices table
CREATE TABLE notice (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  teacher_id VARCHAR(36) NOT NULL,
  lab_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
  FOREIGN KEY (lab_id) REFERENCES lab(id) ON DELETE CASCADE
);
