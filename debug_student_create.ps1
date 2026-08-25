$token = Get-Content admin_token.txt
$headers = @{ Authorization = "Bearer $token" }

$uniqueId = Get-Date -Format "yyyyMMddHHmmss"
$username = "student_$uniqueId"

$studentBody = @{
    username   = $username
    password   = "pass123"
    fullName   = "Debug User $uniqueId"
    email      = "debug_$uniqueId@test.com"
    department = "Debug"
    year       = 1
    phone      = "9876543210"
    cgpa       = 8.0
} | ConvertTo-Json

Write-Host "Creating Student: $username"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students" -Method Post -Headers $headers -ContentType "application/json" -Body $studentBody
    Write-Host "Success! User ID: $($response.userId)"
}
catch {
    Write-Host "Error: $($_.Exception.Response.StatusCode.value__)"
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Body: $($reader.ReadToEnd())"
    }
}
