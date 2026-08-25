# 1. Login Admin
$adminBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
try {
    Write-Host "Logging in as Admin..."
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $adminBody
    $response.token | Set-Content admin_token.txt
    Write-Host "Admin Token Saved."
}
catch {
    Write-Host "Admin Login Failed"
    Write-Host $_
    exit
}

# 2. Run Job Management Tests (Creates Jobs)
Write-Host "Running Job Management Tests..."
./test_job_mgmt.ps1

# 3. Run Student Management Tests (Creates Students)
Write-Host "Running Student Management Tests..."
./test_student_mgmt.ps1

# 4. Login as Student (using the one created in test_student_mgmt.ps1)
# The script updates student to username 'student_verify' password 'pass123'
$studentBody = @{ username = "student_verify"; password = "pass123" } | ConvertTo-Json
try {
    Write-Host "Logging in as Student..."
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $studentBody
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
