# API Testing Guide

This document contains step-by-step instructions to test all API endpoints using cURL or Postman.

## Prerequisites

1. Ensure the application is running on `http://localhost:8080`
2. PostgreSQL database is set up and running
3. Default admin account exists (username: `admin`, password: `admin123`)

---

## 1. Authentication Tests

### Test 1.1: Admin Login

**Request:**
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "ADMIN",
  "userId": 1,
  "username": "admin"
}
```

**Action:** Save the `token` value for subsequent admin requests.

---

## 2. Student Management Tests (Admin)

### Test 2.1: Create Student

**Request:**
```bash
POST http://localhost:8080/api/admin/students
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "username": "student1",
  "password": "pass123",
  "fullName": "Alice Johnson",
  "email": "alice@test.com",
  "department": "Computer Science",
  "year": 3,
  "phone": "9876543210",
  "cgpa": 8.5
}
```

**Expected Response:** Status 201 Created with student details

### Test 2.2: Get All Students (Paginated)

**Request:**
```bash
GET http://localhost:8080/api/admin/students?page=0&size=10
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** Paginated list of students

### Test 2.3: Get Student by ID

**Request:**
```bash
GET http://localhost:8080/api/admin/students/2
Authorization: Bearer <ADMIN_TOKEN>
```

### Test 2.4: Update Student

**Request:**
```bash
PUT http://localhost:8080/api/admin/students/2
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "username": "student1",
  "password": "pass123",
  "fullName": "Alice Johnson Updated",
  "email": "alice@test.com",
  "department": "Information Technology",
  "year": 4,
  "phone": "9876543210",
  "cgpa": 9.0
}
```

---

## 3. Job Management Tests (Admin)

### Test 3.1: Create Job with Custom Fields

**Request:**
```bash
POST http://localhost:8080/api/admin/jobs
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "companyName": "Google",
  "jobRole": "Software Developer",
  "description": "Exciting opportunity for software engineers",
  "eligibilityCriteria": "CGPA >= 7.5",
  "location": "Bangalore",
  "salaryPackage": "18 LPA",
  "applicationDeadline": "2026-03-31",
  "isActive": true,
  "customFields": [
    {
      "fieldName": "Resume URL",
      "fieldType": "URL",
      "isRequired": true,
      "displayOrder": 0
    },
    {
      "fieldName": "GitHub Profile",
      "fieldType": "URL",
      "isRequired": false,
      "displayOrder": 1
    },
    {
      "fieldName": "Why Google?",
      "fieldType": "TEXTAREA",
      "isRequired": true,
      "displayOrder": 2
    }
  ]
}
```

**Expected Response:** Status 201 with job ID

**Action:** Save the `id` value as JOB_ID

### Test 3.2: Get All Jobs

**Request:**
```bash
GET http://localhost:8080/api/admin/jobs?page=0&size=10
Authorization: Bearer <ADMIN_TOKEN>
```

### Test 3.3: Update Job

**Request:**
```bash
PUT http://localhost:8080/api/admin/jobs/<JOB_ID>
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "companyName": "Google Inc.",
  "jobRole": "Senior Software Developer",
  "description": "Updated description",
  "eligibilityCriteria": "CGPA >= 8.0",
  "location": "Mumbai",
  "salaryPackage": "20 LPA",
  "applicationDeadline": "2026-04-30",
  "isActive": true,
  "customFields": [
    {
      "fieldName": "Resume URL",
      "fieldType": "URL",
      "isRequired": true,
      "displayOrder": 0
    }
  ]
}
```

---

## 4. Student Authentication & Profile Tests

### Test 4.1: Student Login

**Request:**
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "student1",
  "password": "pass123"
}
```

**Expected Response:**
```json
{
  "token": "...",
  "role": "STUDENT",
  "userId": 2,
  "username": "student1"
}
```

**Action:** Save the token as STUDENT_TOKEN

### Test 4.2: Get Own Profile

**Request:**
```bash
GET http://localhost:8080/api/student/profile
Authorization: Bearer <STUDENT_TOKEN>
```

### Test 4.3: Update Own Profile

**Request:**
```bash
PUT http://localhost:8080/api/student/profile
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "username": "student1",
  "password": "",
  "fullName": "Alice Johnson",
  "email": "alice@test.com",
  "department": "Computer Science",
  "year": 4,
  "phone": "9876543211",
  "cgpa": 8.8
}
```

---

## 5. Job Browsing Tests (Student)

### Test 5.1: View Active Jobs

**Request:**
```bash
GET http://localhost:8080/api/student/jobs?page=0&size=10
Authorization: Bearer <STUDENT_TOKEN>
```

### Test 5.2: View Job Details

**Request:**
```bash
GET http://localhost:8080/api/student/jobs/<JOB_ID>
Authorization: Bearer <STUDENT_TOKEN>
```

---

## 6. Job Application Tests (Student)

### Test 6.1: Apply for Job

**Request:**
```bash
POST http://localhost:8080/api/student/applications
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "jobId": <JOB_ID>,
  "fieldValues": {
    "Resume URL": "https://drive.google.com/myresume",
    "GitHub Profile": "https://github.com/alice",
    "Why Google?": "I am passionate about technology and innovation..."
  }
}
```

**Expected Result:** 
- Status 201 Created
- Email sent to student (if SMTP is configured)

### Test 6.2: Try Duplicate Application (Should Fail)

**Request:**
```bash
POST http://localhost:8080/api/student/applications
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "jobId": <JOB_ID>,
  "fieldValues": {
    "Resume URL": "https://drive.google.com/resume2"
  }
}
```

**Expected Response:** Status 409 Conflict
```json
{
  "timestamp": "...",
  "status": 409,
  "error": "Conflict",
  "message": "You have already applied for this job"
}
```

### Test 6.3: View Own Applications

**Request:**
```bash
GET http://localhost:8080/api/student/applications
Authorization: Bearer <STUDENT_TOKEN>
```

---

## 7. Application Management Tests (Admin)

### Test 7.1: View Applications for a Job

**Request:**
```bash
GET http://localhost:8080/api/admin/applications/job/<JOB_ID>
Authorization: Bearer <ADMIN_TOKEN>
```

### Test 7.2: Export Applications as CSV

**Request:**
```bash
GET http://localhost:8080/api/admin/applications/export/<JOB_ID>
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Result:** CSV file download

---

## 8. Authorization Tests

### Test 8.1: Student Accessing Admin Endpoint (Should Fail)

**Request:**
```bash
GET http://localhost:8080/api/admin/students
Authorization: Bearer <STUDENT_TOKEN>
```

**Expected Response:** Status 403 Forbidden

### Test 8.2: Admin Accessing Student Endpoint (Should Fail)

**Request:**
```bash
GET http://localhost:8080/api/student/profile
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** Status 403 Forbidden

### Test 8.3: No Token (Should Fail)

**Request:**
```bash
GET http://localhost:8080/api/admin/students
```

**Expected Response:** Status 403 Forbidden

---

## 9. Validation Tests

### Test 9.1: Create Student with Invalid Email

**Request:**
```bash
POST http://localhost:8080/api/admin/students
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "username": "test",
  "password": "pass",
  "fullName": "Test User",
  "email": "invalid-email",
  "department": "CS",
  "year": 1,
  "phone": "1234567890",
  "cgpa": 7.0
}
```

**Expected Response:** Status 400 with validation errors

### Test 9.2: Create Student with Invalid CGPA

**Request:**
```bash
POST http://localhost:8080/api/admin/students
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "username": "test",
  "password": "pass",
  "fullName": "Test User",
  "email": "test@test.com",
  "department": "CS",
  "year": 1,
  "phone": "1234567890",
  "cgpa": 11.0
}
```

**Expected Response:** Status 400 - "CGPA must not exceed 10.0"

---

## 10. Delete Operations Tests (Admin)

### Test 10.1: Delete Student

**Request:**
```bash
DELETE http://localhost:8080/api/admin/students/2
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** Status 204 No Content

### Test 10.2: Delete Job

**Request:**
```bash
DELETE http://localhost:8080/api/admin/jobs/<JOB_ID>
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** Status 204 No Content

---

## Summary Checklist

- [ ] Admin login successful
- [ ] Student CRUD operations working
- [ ] Job management with custom fields working
- [ ] Student login successful
- [ ] Student profile operations working
- [ ] Job browsing for students working
- [ ] Job application submission successful
- [ ] Duplicate application prevented
- [ ] Email sent on application (if configured)
- [ ] Applications visible to admin
- [ ] CSV export successful
- [ ] Role-based access control enforced
- [ ] Validation working correctly
- [ ] Delete operations working

---

## Notes

- Replace `<ADMIN_TOKEN>`, `<STUDENT_TOKEN>`, and `<JOB_ID>` with actual values
- All timestamps are in ISO 8601 format
- Tokens expire after 24 hours
- Email functionality requires SMTP configuration
