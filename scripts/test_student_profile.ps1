$adminToken = Get-Content admin_token.txt
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

$random = Get-Random
$username = "student_auth_$random"
$password = "pass123"
$email = "auth_$random@test.com"

# 1. Create Student (as Admin)
$studentBody = @{
    username   = $username
    password   = $password
    fullName   = "Auth Test User"
    email      = $email
    department = "CS"
    year       = 2
    phone      = "9876543210"
    cgpa       = 8.0
} | ConvertTo-Json

try {
    Write-Host "Creating Student $username..."
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students" -Method Post -Headers $adminHeaders -ContentType "application/json" -Body $studentBody
}
catch {
    Write-Host "Error Creating Student"
    exit
}

# 2. Login as Student
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

try {
    Write-Host "Logging in as Student..."
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $studentToken = $loginResponse.token
    $studentToken | Out-File -FilePath student_token.txt -Encoding ascii
    Write-Host "Student Logged In. Token Length: $($studentToken.Length)"
}
catch {
    Write-Host "Error Logging In"
    Write-Host $_
    exit
}

$studentHeaders = @{ Authorization = "Bearer $studentToken" }

# 3. Get Profile
try {
    Write-Host "Getting Profile..."
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/student/profile" -Method Get -Headers $studentHeaders
    Write-Host "Profile: $($profileResponse.fullName)"
}
catch {
    Write-Host "Error Getting Profile"
    Write-Host $_
}

# 4. Update Profile
$updateBody = @{
    username   = $username
    password   = ""
    fullName   = "Auth Test User Updated"
    email      = $email
    department = "CS"
    year       = 3
    phone      = "9998887776"
    cgpa       = 8.2
} | ConvertTo-Json

try {
    Write-Host "Updating Profile..."
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/student/profile" -Method Put -Headers $studentHeaders -ContentType "application/json" -Body $updateBody
    Write-Host "Updated Profile: $($updateResponse.fullName)"
}
catch {
    Write-Host "Error Updating Profile"
    Write-Host $_
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    }
}
