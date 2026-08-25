$token = Get-Content admin_token.txt
$headers = @{ Authorization = "Bearer $token" }

$jobId = 1 # Assuming Job ID 1 exists from previous tests

# 1. View Applications for Job
try {
    Write-Host "Viewing Applications for Job $jobId..."
    $appsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/applications/job/$jobId" -Method Get -Headers $headers
    Write-Host "Found $($appsResponse.Count) applications"
    if ($appsResponse.Count -gt 0) {
        Write-Host "First Applicant: $($appsResponse[0].studentName)"
    }
}
catch {
    Write-Host "Error Viewing Applications"
    Write-Host $_
}

# 2. Export Applications CSV
try {
    Write-Host "Exporting CSV for Job $jobId..."
    $csvBytes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/applications/export/$jobId" -Method Get -Headers $headers
    if ($csvBytes) {
        Write-Host "CSV content received. Length: $($csvBytes.Length)"
        # Convert bytes to string to verify header
        # Note: Invoke-RestMethod might decode string automatically if content-type is text
        Write-Host "CSV Preview: $($csvBytes | Select-Object -First 1)"
    }
}
catch {
    Write-Host "Error Exporting CSV"
    Write-Host $_
}
