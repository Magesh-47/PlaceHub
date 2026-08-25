$token = Get-Content admin_token.txt
$headers = @{ Authorization = "Bearer $token" }

# 1. Create Student
$studentBody = @{
    username = "student_verify_new"
    password = "pass123"
    fullName = "Verify User"
    email = "verify@test.com"
    department = "CS"
    year = 3
    phone = "9876543210"
    cgpa = 8.5
} | ConvertTo-Json

try {
    Write-Host "Creating Student..."
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students" -Method Post -Headers $headers -ContentType "application/json" -Body $studentBody
    Write-Host "Created Student ID: $($createResponse.userId)"
} catch {
    Write-Host "Error Creating Student:"
    Write-Host $_.Exception.Response.StatusCode.value__
    Write-Host $_.ErrorDetails.Message
    exit
}

# 2. List Students
try {
    Write-Host "Listing Students..."
    $listResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students?page=0&size=10" -Method Get -Headers $headers
    Write-Host "Found $($listResponse.content.Count) students"
} catch {
    Write-Host "Error Listing Students"
    Write-Host $_
}

# 3. Get Student
try {
    $studentId = $createResponse.userId
    Write-Host "Getting Student $studentId..."
    $getResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students/$studentId" -Method Get -Headers $headers
    Write-Host "Got Student: $($getResponse.username)"
} catch {
    Write-Host "Error Getting Student"
    Write-Host $_
}

# 4. Update Student
$updateBody = @{
    username = "student_verify"
    password = "pass123"
    fullName = "Verify User Updated"
    email = "verify@test.com"
    department = "IT"
    year = 4
    phone = "9876543210"
    cgpa = 9.0
} | ConvertTo-Json

try {
    $studentId = $createResponse.userId

    Write-Host "Updating Student $studentId..."
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students/$studentId" -Method Put -Headers $headers -ContentType "application/json" -Body $updateBody
    Write-Host "Updated Student: $($updateResponse.fullName)"
} catch {
    Write-Host "Error Updating Student"
    Write-Host $_
}
