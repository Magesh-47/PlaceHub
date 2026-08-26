$username = "student_20260201155834"
$password = "pass123"

Write-Host ">>> STEP 1: LOGIN"
$loginBody = @{ username = $username; password = $password } | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.token
    Write-Host "Login Success!"
}
catch {
    Write-Host "Login Failed"
    Write-Host $_.Exception.Response.StatusCode.value__
    exit
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host ">>> STEP 2: BROWSE JOBS"
try {
    $jobsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/student/jobs?page=0&size=10" -Method Get -Headers $headers
    $jobId = $jobsResponse.content[0].id
    Write-Host "Found Job ID: $jobId"
}
catch {
    Write-Host "Browse/Get Jobs Failed"
    Write-Host $_
    exit
}

Write-Host ">>> STEP 3: APPLY FOR JOB"
$appBody = @{
    jobId       = $jobId
    fieldValues = @{
        "Resume URL"  = "https://example.com/resume"
        "Why Google?" = "Because it is cool."
    }
} | ConvertTo-Json

try {
    $appResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/student/applications" -Method Post -Headers $headers -ContentType "application/json" -Body $appBody
    Write-Host "APPLICATION SUBMITTED SUCCESSFULLY!"
    Write-Host "Status: $($appResponse.applicationStatus)"
}
catch {
    Write-Host "Application Failed"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        
        Write-Host "RAW BODY START"
        Write-Host $body
        Write-Host "RAW BODY END"
        
        try {
            $json = $body | ConvertFrom-Json
            Write-Host "Parsed Message: $($json.message)"
            Write-Host "Parsed Error: $($json.error)"
        }
        catch {
            Write-Host "JSON Parse Failed"
        }
    }
    else {
        Write-Host $_
    }
}
