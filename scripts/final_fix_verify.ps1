# Reuse the working logic from debug_student_create.ps1
$token = Get-Content admin_token.txt
$headers = @{ Authorization = "Bearer $token" }

$uniqueId = Get-Date -Format "yyyyMMddHHmmss"
$username = "final_student_$uniqueId"
$password = "pass123"

$studentBody = @{
    username   = $username
    password   = $password
    fullName   = "Final Verify $uniqueId"
    email      = "final_$uniqueId@test.com"
    department = "Final"
    year       = 1
    phone      = "9876543210"
    cgpa       = 8.0
} | ConvertTo-Json

Write-Host "Creating Student: $username"
try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students" -Method Post -Headers $headers -ContentType "application/json" -Body $studentBody
    Write-Host "Success! User ID: $($createResponse.userId)"
}
catch {
    Write-Host "Error Creating Student: $($_.Exception.Response.StatusCode.value__)"
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Body: $($reader.ReadToEnd())"
    }
    exit
}

# Login
Write-Host "Logging in..."
$studentAuth = @{ username = $username; password = $password } | ConvertTo-Json
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $studentAuth
    $response.token | Set-Content student_token.txt
    Write-Host "Logged in. Token saved."
}
catch {
    Write-Host "Login Failed"
    Write-Host $_
    exit
}

# Run Application Test
Write-Host "Running Application Test..."
./test_job_application.ps1
