$username = "student_20260201155834"
$password = "pass123"

Write-Host "Attempting login for: $username"
$body = @{ username = $username; password = $password } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $body
    Write-Host "Login Success!"
    Write-Host "Token: $($response.token)"
}
catch {
    Write-Host "Login Failed. Status: $($_.Exception.Response.StatusCode.value__)"
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Error Body: $($reader.ReadToEnd())"
    }
}
