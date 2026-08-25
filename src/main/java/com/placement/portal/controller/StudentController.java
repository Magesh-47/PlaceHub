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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private JobService jobService;

    @Autowired
    private ApplicationService applicationService;

    // ========== Profile Management ==========

    @GetMapping("/profile")
    public ResponseEntity<StudentResponse> getProfile(Authentication authentication) {
        String username = authentication.getName();
        StudentResponse response = studentService.getStudentByUsername(username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentResponse> updateProfile(
            @Valid @RequestBody StudentRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        StudentResponse currentProfile = studentService.getStudentByUsername(username);
        StudentResponse response = studentService.updateStudent(currentProfile.getUserId(), request, username);
        return ResponseEntity.ok(response);
    }

    // ========== Job Browsing ==========

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobResponse>> getActiveJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<JobResponse> jobs = jobService.getActiveJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        JobResponse response = jobService.getJobById(id);
        return ResponseEntity.ok(response);
    }

    // ========== Application Management ==========

    @PostMapping(value = "/applications", consumes = { "multipart/form-data" })
    public ResponseEntity<ApplicationResponse> applyForJob(
            @RequestPart("application") @Valid ApplicationRequest request,
            org.springframework.web.multipart.MultipartHttpServletRequest fileRequest,
            Authentication authentication) {
        String username = authentication.getName();
        ApplicationResponse response = applicationService.submitApplication(username, request, fileRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(Authentication authentication) {
        String username = authentication.getName();
        List<ApplicationResponse> applications = applicationService.getApplicationsByStudent(username);
        return ResponseEntity.ok(applications);
    }
}
