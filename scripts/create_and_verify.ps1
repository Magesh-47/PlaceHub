# 1. Login Admin to create student
$adminBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $adminBody
$token = $response.token
$headers = @{ Authorization = "Bearer $token" }

# 2. Create UNIQUE Student
$uniqueId = Get-Date -Format "yyyyMMddHHmmss"
$username = "ver_user_$uniqueId"
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
    exit
}

# 3. Login as New Student
$studentAuth = @{ username = $username; password = $password } | ConvertTo-Json
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $studentAuth
    $studentToken = $response.token
    Write-Host "Student Login Success"
}
catch {
    Write-Host "Student Login Failed"
    exit
}

$studentHeaders = @{ Authorization = "Bearer $studentToken" }

# 4. Browse Jobs
try {
    $jobsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/student/jobs?page=0&size=10" -Method Get -Headers $studentHeaders
    $jobId = $jobsResponse.content[0].id
    Write-Host "Found Job ID: $jobId"
}
catch {
    Write-Host "Browse Jobs Failed"
    exit
}

# 5. Apply
Write-Host "Applying for Job $jobId..."
$appBody = @{
    jobId       = $jobId
    fieldValues = @{
        "Resume URL"  = "https://example.com/resume"
        "Why Google?" = "Because I want to."
    }
} | ConvertTo-Json

try {
    $appResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/student/applications" -Method Post -Headers $studentHeaders -ContentType "application/json" -Body $appBody
    Write-Host "APPLICATION SUBMITTED: $($appResponse.applicationStatus)"
}
catch {
    Write-Host "Application Failed"
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Error: $($reader.ReadToEnd())"
    }
    else {
        Write-Host $_
    }
}
