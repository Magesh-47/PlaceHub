$username = "student_20260201155834"
$password = "pass123"

# Login
Write-Host "Logging in as $username..."
try {
    $studentAuth = @{ username = $username; password = $password } | ConvertTo-Json
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
