# Placement Portal Backend

A complete Spring Boot backend for a Placement Portal with JWT authentication, role-based access control, dynamic job application forms, and email notifications.

## Features

### Admin Features
- ✅ JWT-based authentication
- ✅ Create, view, edit, and delete student accounts
- ✅ Manage jobs with custom application fields
- ✅ View all applications by job
- ✅ Export applications to CSV
- ✅ Pagination support

### Student Features
- ✅ JWT-based authentication
- ✅ View and edit profile
- ✅ Browse active jobs
- ✅ Apply for jobs with dynamic fields
- ✅ Duplicate application prevention
- ✅ View application status
- ✅ Email confirmation on application

## Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Database**: PostgreSQL
- **Security**: Spring Security + JWT
- **ORM**: JPA / Hibernate
- **Email**: Spring Boot Mail (SMTP)
- **Build Tool**: Maven
- **Java Version**: 17

## Prerequisites

Before running the application, ensure you have:

1. **Java 17** or higher installed
2. **PostgreSQL** installed and running
3. **Maven** installed (or use the Maven wrapper)
4. (**Optional**) SMTP email credentials (Gmail recommended)

## Database Setup

The application is intended to use a **persistent PostgreSQL database**. The default properties in the repository have been updated accordingly; data will survive restarts.

1. Install and start PostgreSQL if you haven't already.
2. Create a database for the app:
   ```sql
   CREATE DATABASE placement_portal;
   ```
3. Update the credentials in `backend/src/main/resources/application.properties` with your PostgreSQL username/password (the URL is already set to `jdbc:postgresql://localhost:5432/placement_portal`).

> **Note:** earlier versions used an in‑memory H2 instance (`jdbc:h2:mem:placement_portal`) for development/testing. That configuration is now commented out in `application.properties`. If you only need a transient DB for experiments, you can re-enable the H2 block temporarily.

## Email Configuration

To enable email functionality, update SMTP settings in `application.properties`:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the generated password in the configuration

> **Note**: Email sending is optional. The application will work without it, but emails won't be sent.

## Running the Application

### Option 1: Using Maven

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Option 2: Using Maven Wrapper (if available)

```bash
cd backend
./mvnw.cmd clean install
./mvnw.cmd spring-boot:run
```

> Only `mvnw.cmd` (Windows) is present — there is no POSIX `mvnw` script.

### Option 3: Using IDE

Importthe project as a Maven project in your IDE (IntelliJ IDEA, Eclipse, etc.) and run the main class:
```
com.placement.portal.PlacementPortalApplication
```

The application will start on **http://localhost:8080**

## Default Admin Account

A default admin account is created automatically on first startup:

- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **Important**: Change this password immediately after first login!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (Admin & Student)

### Admin Endpoints (Requires ADMIN role)

**Student Management:**
- `POST /api/admin/students` - Create student
- `GET /api/admin/students?page=0&size=10` - Get all students
- `GET /api/admin/students/{id}` - Get student by ID
- `PUT /api/admin/students/{id}` - Update student
- `DELETE /api/admin/students/{id}` - Delete student

**Job Management:**
- `POST /api/admin/jobs` - Create job
- `GET /api/admin/jobs?page=0&size=10` - Get all jobs
- `GET /api/admin/jobs/{id}` - Get job by ID
- `PUT /api/admin/jobs/{id}` - Update job
- `DELETE /api/admin/jobs/{id}` - Delete job

**Application Management:**
- `GET /api/admin/applications/job/{jobId}` - Get applications by job
- `GET /api/admin/applications/export/{jobId}` - Export applications as CSV

### Student Endpoints (Requires STUDENT role)

**Profile:**
- `GET /api/student/profile` - Get own profile
- `PUT /api/student/profile` - Update own profile

**Jobs:**
- `GET /api/student/jobs?page=0&size=10` - Get active jobs
- `GET /api/student/jobs/{id}` - Get job details

**Applications:**
- `POST /api/student/applications` - Apply for a job
- `GET /api/student/applications` - Get own applications

## API Usage Examples

### 1. Admin Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "ADMIN",
  "userId": 1,
  "username": "admin"
}
```

### 2. Create Student (Admin)
```bash
curl -X POST http://localhost:8080/api/admin/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "username": "john.doe",
    "password": "password123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "department": "Computer Science",
    "year": 3,
    "phone": "1234567890",
    "cgpa": 8.5
  }'
```

### 3. Create Job with Custom Fields (Admin)
```bash
curl -X POST http://localhost:8080/api/admin/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "companyName": "Tech Corp",
    "jobRole": "Software Engineer",
    "description": "Full stack developer position",
    "eligibilityCriteria": "CGPA >= 7.0",
    "location": "Bangalore",
    "salaryPackage": "12 LPA",
    "applicationDeadline": "2026-02-28",
    "isActive": true,
    "customFields": [
      {
        "fieldName": "Resume Link",
        "fieldType": "URL",
        "isRequired": true,
        "displayOrder": 0
      },
      {
        "fieldName": "Cover Letter",
        "fieldType": "TEXTAREA",
        "isRequired": false,
        "displayOrder": 1
      }
    ]
  }'
```

### 4. Student Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "password123"
  }'
```

### 5. Apply for Job (Student)
```bash
curl -X POST http://localhost:8080/api/student/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -d '{
    "jobId": 1,
    "fieldValues": {
      "Resume Link": "https://drive.google.com/resume",
      "Cover Letter": "I am very interested in this position..."
    }
  }'
```

## Repository Layout

```
placementportal/
├── backend/        # Spring Boot API (pom.xml, src/, mvnw.cmd, .mvn/)
├── frontend/       # React + Vite SPA
├── docs/           # API guide, DB design, report, Postman collection
├── scripts/        # PowerShell API test/verify scripts
└── README.md
```

Frontend source is organised as:

```
frontend/src/
├── main.jsx
├── App.jsx              # routes + providers
├── components/          # Layout, Sidebar, Loader, PageHeader, …
├── context/             # AuthContext, ThemeContext
├── pages/
│   ├── auth/            # Login
│   ├── admin/           # Dashboard, Students, Jobs, Applications
│   └── student/         # Dashboard, Jobs, Profile, Applications
├── services/            # axios client
└── styles/              # index.css entry + 8 per-concern modules
```

> `styles/index.css` is an import manifest only. CSS is order-dependent, so
> keep the `@import` order as written: tokens first, responsive last.

## Project Structure

```
backend/src/main/java/com/placement/portal/
├── PlacementPortalApplication.java     # Main application class
├── config/
│   ├── SecurityConfig.java             # Spring Security configuration
│   ├── JwtAuthenticationFilter.java    # JWT filter
│   └── DataInitializer.java            # Default admin initializer
├── entity/
│   ├── User.java                       # User entity (Admin/Student)
│   ├── StudentProfile.java             # Student profile
│   ├── Job.java                        # Job entity
│   ├── ApplicationFieldDefinition.java # Custom field definition
│   ├── JobApplication.java             # Application entity
│   └── ApplicationFieldValue.java      # Custom field values
├── repository/
│   └── [All repository interfaces]
├── dto/
│   └── [All DTOs for request/response]
├── service/
│   ├── AuthService.java                # Authentication logic
│   ├── StudentService.java             # Student operations
│   ├── JobService.java                 # Job operations
│   ├── ApplicationService.java         # Application logic
│   ├── EmailService.java               # Email sending
│   └── JwtService.java                 # JWT token management
├── controller/
│   ├── AuthController.java             # Auth endpoints
│   ├── AdminController.java            # Admin endpoints
│   └── StudentController.java          # Student endpoints
└── exception/
    ├── GlobalExceptionHandler.java     # Global exception handling
    └── [Custom exceptions]
```

## Database Schema

The application automatically creates the following tables:

- `users` - User accounts (Admin & Student)
- `student_profiles` - Student details
- `jobs` - Job postings
- `application_field_definitions` - Custom fields for jobs
- `job_applications` - Student applications
- `application_field_values` - Custom field values

## Security

- **Password Encryption**: BCrypt algorithm
- **JWT Token**: 24-hour expiration
- **Role-Based Access**: Admin and Student roles
- **CORS**: Enabled for cross-origin requests

## Error Handling

The API returns standardized error responses:

```json
{
  "timestamp": "2026-01-10T21:39:44",
  "status": 404,
  "error": "Not Found",
  "message": "Student not found"
}
```

## Validation

All DTOs include validation:
- Required field checks
- Email format validation
- CGPA range (0.0 - 10.0)
- Phone number format (10 digits)
- Username uniqueness

## Testing

Use tools like **Postman**, **Insomnia**, or **cURL** to test the APIs.

A Postman collection can be created with all the endpoints mentioned above.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `application.properties`
- Check database name exists

### Email Not Sending
- Verify SMTP credentials
- Check Gmail app password (not regular password)
- Email errors are logged but won't stop the application

### JWT Token Errors
- Ensure token is included in Authorization header as `Bearer <token>`
- Check token hasn't expired (24 hours)
- Verify correct role for the endpoint

## Future Enhancements

- [ ] Profile picture upload
- [ ] Application status update by admin
- [ ] Job search and filtering
- [ ] Email templates with HTML
- [ ] Unit and integration tests
- [ ] API documentation with Swagger/OpenAPI

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the repository.
#   P l a c e H u b  
 