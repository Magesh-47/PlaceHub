$token = Get-Content admin_token.txt
$headers = @{ Authorization = "Bearer $token" }

# 1. Delete Job (with applications)
# Job ID 1 was used and has applications.
$jobId = 1
try {
    Write-Host "Deleting Job $jobId (which has applications)..."
    Invoke-RestMethod -Uri "http://localhost:8080/api/admin/jobs/$jobId" -Method Delete -Headers $headers
    Write-Host "Job deleted successfully (Cascade verified?)"
    
    # Verify deletion
    try {
        Invoke-RestMethod -Uri "http://localhost:8080/api/admin/jobs/$jobId" -Method Get -Headers $headers
        Write-Host "FAILURE: Job still exists!"
    }
    catch {
        Write-Host "Confirmed: Job not found (after delete)"
    }
}
catch {
    Write-Host "Error Deleting Job"
    Write-Host $_
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    }
}

# 2. Delete Student
# Student ID 3? or get list and delete one.
# From previous log: "Created Student ID: 3"
try {
    $list = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students" -Method Get -Headers $headers
    $students = $list.content
    if ($students.Count -gt 0) {
        $studentToDelete = $students[0].userId
        Write-Host "Deleting Student ID $studentToDelete..."
        Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students/$studentToDelete" -Method Delete -Headers $headers
        Write-Host "Student deleted successfully"
    }
}
catch {
    Write-Host "Error Deleting Student"
    Write-Host $_
}
