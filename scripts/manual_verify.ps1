# 1. Login Admin
$adminBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $adminBody
$response.token | Set-Content admin_token.txt
Write-Host "Admin Token Saved."

# 2. Create Student
$token = Get-Content admin_token.txt
$headers = @{ Authorization = "Bearer $token" }

$uniqueId = Get-Date -Format "yyyyMMddHHmmss"
$username = "man_student_$uniqueId"
$password = "pass123"

$studentBody = @{
    username   = $username
    password   = $password
    fullName   = "Manual Verify $uniqueId"
    email      = "man_$uniqueId@test.com"
    department = "Manual"
    year       = 4
    phone      = "9876543210"
    cgpa       = 9.0
} | ConvertTo-Json

Write-Host "Creating Student: $username"
try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students" -Method Post -Headers $headers -ContentType "application/json" -Body $studentBody
    Write-Host "Created Student ID: $($createResponse.userId)"
}
catch {
    Write-Host "Error Creating Student"
    Write-Host $_
    exit
}

# 3. Login Student
$studentAuth = @{ username = $username; password = $password } | ConvertTo-Json
try {
    Write-Host "Logging in as Student..."
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $studentAuth
    $response.token | Set-Content student_token.txt
    Write-Host "Student Token Saved."
}
catch {
    Write-Host "Student Login Failed"
    Write-Host $_
    exit
}

# 4. Verify Job Application
# We run test_job_application.ps1 which handles browsing and applying
Write-Host "Running Job Application Test..."
./test_job_application.ps1
