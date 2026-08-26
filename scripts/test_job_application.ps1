$studentToken = Get-Content student_token.txt
$headers = @{ Authorization = "Bearer $studentToken" }

# 1. View Active Jobs
try {
    Write-Host "STEP 1: Browsing Jobs..."
    $jobsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/student/jobs?page=0&size=10" -Method Get -Headers $headers
    $jobCount = $jobsResponse.content.Count
    Write-Host "Found $jobCount active jobs"
    
    if ($jobCount -eq 0) {
        Write-Host "No jobs found, cannot proceed."
        exit
    }
    
    $jobId = $jobsResponse.content[0].id
    Write-Host "Selected Job ID: $jobId"
}
catch {
    Write-Host "STEP 1 FAILED"
    Write-Host $_
    exit
}

# 2. View Job Details
try {
    Write-Host "Viewing Job Details..."
    $jobDetails = Invoke-RestMethod -Uri "http://localhost:8080/api/student/jobs/$jobId" -Method Get -Headers $headers
    Write-Host "Job Role: $($jobDetails.jobRole)"
    Write-Host "Custom Fields: $($jobDetails.customFields | ConvertTo-Json -Depth 2)"
}
catch {
    Write-Host "Error Viewing Job"
    Write-Host $_
    exit
}

# 3. Apply for Job
$appBody = @{
    jobId       = $jobId
    fieldValues = @{
        "Resume URL"  = "https://example.com/resume"
        "Why Google?" = "Because it is cool."
    }
} | ConvertTo-Json

try {
    Write-Host "Applying for Job..."
    $appResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/student/applications" -Method Post -Headers $headers -ContentType "application/json" -Body $appBody
    Write-Host "Application Status: $($appResponse.status)"
}
catch {
    Write-Host "Error Applying for Job"
    Write-Host $_
    # Check if duplicate application (409) which is acceptable if re-running
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Conflict) {
        Write-Host "Duplicate Application detected (Expected if re-running)"
    }
    else {
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host $reader.ReadToEnd()
        }
        exit 
    }
}

# 4. Try Duplicate Application (Should Fail)
try {
    Write-Host "Attempting Duplicate Application..."
    $dupResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/student/applications" -Method Post -Headers $headers -ContentType "application/json" -Body $appBody
    Write-Host "Unexpected Success on Duplicate!"
}
catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Conflict) {
        Write-Host "Success: Duplicate Application Rejected (409 Conflict)"
    }
    else {
        Write-Host "Unexpected Error on Duplicate check"
        Write-Host $_
    }
}

# 5. View My Applications
try {
    Write-Host "Viewing My Applications..."
    $myApps = Invoke-RestMethod -Uri "http://localhost:8080/api/student/applications" -Method Get -Headers $headers
    Write-Host "Found $($myApps.Count) applications"
    $myApp = $myApps | Where-Object { $_.jobId -eq $jobId }
    if ($myApp) {
        Write-Host "Confirmed application for Job $jobId"
    }
    else {
        Write-Host "Application for Job $jobId not found in list!"
    }
}
catch {
    Write-Host "Error Viewing My Applications"
    Write-Host $_
}
