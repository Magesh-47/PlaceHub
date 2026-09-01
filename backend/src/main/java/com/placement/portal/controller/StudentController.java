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

    @PostMapping(value = "/profile/picture", consumes = { "multipart/form-data" })
    public ResponseEntity<StudentResponse> updateProfilePicture(
            @RequestPart("file") org.springframework.web.multipart.MultipartFile file,
            Authentication authentication) {
        StudentResponse response = studentService.updateProfilePicture(authentication.getName(), file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/details")
    public ResponseEntity<StudentProfileDetailsResponse> getProfileDetails(Authentication authentication) {
        return ResponseEntity.ok(studentService.getProfileDetails(authentication.getName()));
    }

    @PutMapping("/profile/summary")
    public ResponseEntity<StudentProfileDetailsResponse> updateSummary(
            @Valid @RequestBody SummaryUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(studentService.updateSummary(authentication.getName(), request.getSummary()));
    }

    // ========== Job Browsing ==========

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobResponse>> getActiveJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "applicationDeadline") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        org.springframework.data.domain.Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction)
                ? org.springframework.data.domain.Sort.Direction.DESC
                : org.springframework.data.domain.Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(sortDirection, sortBy));
        Page<JobResponse> jobs = jobService.searchActiveJobs(pageable, keyword, location);
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
