$adminToken = Get-Content admin_token.txt
$studentToken = Get-Content student_token.txt

$adminHeaders = @{ Authorization = "Bearer $adminToken" }
$studentHeaders = @{ Authorization = "Bearer $studentToken" }

# 1. Student accessing Admin API (Should Fail)
try {
    Write-Host "Student accessing Admin API..."
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students" -Method Get -Headers $studentHeaders
    Write-Host "FAILURE: Student accessed Admin API!"
}
catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) {
        Write-Host "SUCCESS: Student blocked from Admin API (403)"
    }
    else {
        Write-Host "Unexpected status code: $($_.Exception.Response.StatusCode)"
    }
}

# 2. Admin accessing Student Profile (Should Fail - usually checking 'My Profile' considers token user)
# But accessing /api/student/profile with Admin token should authenticate as Admin, 
# and if controller checks Role, it should fail.
try {
    Write-Host "Admin accessing Student Profile API..."
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/student/profile" -Method Get -Headers $adminHeaders
    Write-Host "FAILURE: Admin accessed Student Profile!"
}
catch {
    # It might return 403 or 404 (if user not found in student table)
    # Controller says @PreAuthorize("hasRole('STUDENT')")
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) {
        Write-Host "SUCCESS: Admin blocked from Student API (403)"
    }
    else {
        Write-Host "Unexpected status: $($_.Exception.Response.StatusCode)"
        # Note: If admin user is not in student_profile table, it might return 404 from service before 403 limit???
        # No, PreAuthorize happens before method execution if proxy is set up correctly.
    }
}

# 3. No Token (Should Fail)
try {
    Write-Host "Accessing API without Token..."
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/jobs" -Method Get
    Write-Host "FAILURE: Accessed API without token!"
}
catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden -or $_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Unauthorized) {
        Write-Host "SUCCESS: Blocked without token ($($_.Exception.Response.StatusCode))"
    }
    else {
        Write-Host "Unexpected status: $($_.Exception.Response.StatusCode)"
    }
}
