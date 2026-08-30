package com.placement.portal.controller;

import com.placement.portal.dto.*;
import com.placement.portal.service.ApplicationService;
import com.placement.portal.service.JobService;
import com.placement.portal.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private JobService jobService;

    @Autowired
    private ApplicationService applicationService;

    // ========== Student Management ==========

    @PostMapping("/students")
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody StudentRequest request) {
        StudentResponse response = studentService.createStudent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/students")
    public ResponseEntity<Page<StudentResponse>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String name) {
        Pageable pageable = PageRequest.of(page, size);
        Page<StudentResponse> students = studentService.getAllStudents(pageable, department, name);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/students/export")
    public ResponseEntity<byte[]> exportStudents(@RequestParam(required = false) String department) {
        byte[] csvData = studentService.exportStudentsToCSV(department);

        String filename = "students";
        if (department != null && !department.isEmpty()) {
            filename += "_" + department;
        }
        filename += ".csv";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", filename);

        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        StudentResponse response = studentService.getStudentById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {
        StudentResponse response = studentService.updateStudent(id, request, null);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Job Management ==========

    @PostMapping("/jobs")
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request) {
        JobResponse response = jobService.createJob(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<JobResponse> jobs = jobService.getAllJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        JobResponse response = jobService.getJobById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request) {
        JobResponse response = jobService.updateJob(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Application Management ==========

    @GetMapping("/applications/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJob(
            @PathVariable Long jobId,
            @RequestParam(required = false) String department) {
        List<ApplicationResponse> applications = applicationService.getApplicationsByJob(jobId, department);
        return ResponseEntity.ok(applications);
    }

    @PatchMapping("/applications/{id}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusUpdateRequest request) {
        ApplicationResponse response = applicationService.updateApplicationStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/applications/export/{jobId}")
    public ResponseEntity<byte[]> exportApplications(
            @PathVariable Long jobId,
            @RequestParam(required = false) String department) {
        byte[] csvData = applicationService.exportApplicationsToCSV(jobId, department);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "applications_job_" + jobId + ".csv");

        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }

    @GetMapping("/applications/export-zip/{jobId}")
    public ResponseEntity<byte[]> exportApplicationsZip(
            @PathVariable Long jobId,
            @RequestParam(required = false) String department) {
        byte[] zipData = applicationService.exportApplicationsToZip(jobId, department);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/zip"));
        headers.setContentDispositionFormData("attachment", "applications_job_" + jobId + ".zip");

        return new ResponseEntity<>(zipData, headers, HttpStatus.OK);
    }

    // ========== Password Management ==========

    @Autowired
    private com.placement.portal.service.AuthService authService;

    @PostMapping("/request-password-otp")
    public ResponseEntity<String> requestPasswordOtp(java.security.Principal principal) {
        String response = authService.generateAdminOtp(principal.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password-otp")
    public ResponseEntity<Void> changePasswordOtp(
            @Valid @RequestBody AdminChangePasswordRequest request,
            java.security.Principal principal) {
        authService.verifyAdminOtpAndChangePassword(principal.getName(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/students/{id}/reset-password")
    public ResponseEntity<Void> resetStudentPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetStudentPassword(id, request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
