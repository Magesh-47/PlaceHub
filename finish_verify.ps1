# 1. Ensure Admin Token
if (-not (Test-Path admin_token.txt)) {
    Write-Host "Admin Token not found! re-login..."
    $adminBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $adminBody
    $response.token | Set-Content admin_token.txt
}

# 2. Run Job Mgmt to ensure jobs
Write-Host "Creating Jobs..."
./test_job_mgmt.ps1

# 3. Create NEW Student
$token = Get-Content admin_token.txt
$headers = @{ Authorization = "Bearer $token" }

$uniqueId = Get-Date -Format "yyyyMMddHHmmss"
$username = "student_ver_$uniqueId"
$password = "pass123"

$studentBody = @{
    username   = $username
    password   = $password
    fullName   = "Verify User $uniqueId"
    email      = "ver_$uniqueId@test.com"
    department = "Verify"
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

# 4. Login as New Student
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

# 5. Run Job Application Test
Write-Host "Running Job Application Test..."
./test_job_application.ps1
