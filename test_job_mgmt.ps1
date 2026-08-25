$token = Get-Content admin_token.txt
$headers = @{ Authorization = "Bearer $token" }

# 1. Create Job
$jobBody = @{
    companyName         = "Google"
    jobRole             = "Software Developer"
    description         = "Exciting opportunity"
    eligibilityCriteria = "CGPA >= 7.5"
    location            = "Bangalore"
    salaryPackage       = "18 LPA"
    applicationDeadline = "2026-03-31"
    isActive            = $true
    customFields        = @(
        @{
            fieldName    = "Resume URL"
            fieldType    = "URL"
            isRequired   = $true
            displayOrder = 0
        },
        @{
            fieldName    = "Why Google?"
            fieldType    = "TEXTAREA"
            isRequired   = $true
            displayOrder = 1
        }
    )
} | ConvertTo-Json -Depth 4

try {
    Write-Host "Creating Job..."
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/jobs" -Method Post -Headers $headers -ContentType "application/json" -Body $jobBody
    Write-Host "Created Job ID: $($createResponse.id)"
}
catch {
    Write-Host "Error Creating Job:"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody
    exit
}

# 2. List Jobs
try {
    Write-Host "Listing Jobs..."
    $listResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/jobs?page=0&size=10" -Method Get -Headers $headers
    Write-Host "Found $($listResponse.content.Count) jobs"
}
catch {
    Write-Host "Error Listing Jobs"
    Write-Host $_
}

# 3. Update Job
$updateBody = @{
    companyName         = "Google Inc."
    jobRole             = "Senior Software Developer"
    description         = "Updated description"
    eligibilityCriteria = "CGPA >= 8.0"
    location            = "Mumbai"
    salaryPackage       = "20 LPA"
    applicationDeadline = "2026-04-30"
    isActive            = $true
    customFields        = @(
        @{
            fieldName    = "Resume URL"
            fieldType    = "URL"
            isRequired   = $true
            displayOrder = 0
        }
    )
} | ConvertTo-Json -Depth 4

try {
    $jobId = $createResponse.id
    Write-Host "Updating Job $jobId..."
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/jobs/$jobId" -Method Put -Headers $headers -ContentType "application/json" -Body $updateBody
    Write-Host "Updated Job: $($updateResponse.jobRole)"
}
catch {
    Write-Host "Error Updating Job"
    Write-Host $_
}
