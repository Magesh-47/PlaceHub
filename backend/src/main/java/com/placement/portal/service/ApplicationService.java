package com.placement.portal.service;

import com.opencsv.CSVWriter;
import com.placement.portal.dto.ApplicationRequest;
import com.placement.portal.dto.ApplicationResponse;
import com.placement.portal.entity.*;
import com.placement.portal.exception.DuplicateApplicationException;
import com.placement.portal.exception.ResourceNotFoundException;
import com.placement.portal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ApplicationService {

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private ApplicationFieldDefinitionRepository fieldDefinitionRepository;

    @Autowired
    private ApplicationFieldValueRepository fieldValueRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public ApplicationResponse submitApplication(String username, ApplicationRequest request,
            org.springframework.web.multipart.MultipartHttpServletRequest fileRequest) {
        // Validate request parameters
        if (request.getJobId() == null) {
            throw new IllegalArgumentException("Job ID is required");
        }
        if (request.getFieldValues() == null) {
            throw new IllegalArgumentException("Field values are required");
        }

        // Find student by username
        StudentProfile student = studentProfileRepository.findByUserId(
                getUserIdByUsername(username))
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Check if job exists
        Job job = jobRepository.findById(Objects.requireNonNull(request.getJobId(), "Job ID cannot be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Check for duplicate application
        if (applicationRepository.existsByStudentIdAndJobId(student.getId(), job.getId())) {
            throw new DuplicateApplicationException("You have already applied for this job");
        }

        // Validate all required fields are provided
        List<ApplicationFieldDefinition> fieldDefinitions = fieldDefinitionRepository
                .findByJobIdOrderByDisplayOrderAsc(job.getId());

        for (ApplicationFieldDefinition fieldDef : fieldDefinitions) {
            if (fieldDef.getIsRequired()) {
                String value = request.getFieldValues().get(fieldDef.getFieldName());
                if (value == null || value.trim().isEmpty()) {
                    // Check if it's a file field
                    if (fieldDef.getFieldType() == ApplicationFieldDefinition.FieldType.FILE) {
                        org.springframework.web.multipart.MultipartFile file = fileRequest
                                .getFile("file_" + fieldDef.getFieldName());
                        if (file == null || file.isEmpty()) {
                            throw new IllegalArgumentException(
                                    "Required file '" + fieldDef.getFieldName() + "' is missing");
                        }
                    } else {
                        throw new IllegalArgumentException(
                                "Required field '" + fieldDef.getFieldName() + "' is missing");
                    }
                }
            }
        }

        // Create application
        JobApplication application = new JobApplication();
        application.setStudent(student);
        application.setJob(job);
        application.setApplicationStatus(JobApplication.ApplicationStatus.SUBMITTED);

        JobApplication savedApplication = applicationRepository.save(application);

        // Save field values
        for (ApplicationFieldDefinition fieldDef : fieldDefinitions) {
            ApplicationFieldValue fieldValue = new ApplicationFieldValue();
            fieldValue.setApplication(savedApplication);
            fieldValue.setFieldDefinition(fieldDef);

            if (fieldDef.getFieldType() == ApplicationFieldDefinition.FieldType.FILE) {
                org.springframework.web.multipart.MultipartFile file = fileRequest
                        .getFile("file_" + fieldDef.getFieldName());
                if (file != null && !file.isEmpty()) {
                    try {
                        fieldValue.setFileData(file.getBytes());
                        fieldValue.setFileName(file.getOriginalFilename());
                        fieldValue.setFileType(file.getContentType());
                    } catch (java.io.IOException e) {
                        throw new RuntimeException("Failed to process file upload", e);
                    }
                }
            } else {
                String value = request.getFieldValues().get(fieldDef.getFieldName());
                if (value != null && !value.trim().isEmpty()) {
                    fieldValue.setFieldValue(value);
                }
            }

            if (fieldValue.getFieldValue() != null || fieldValue.getFileData() != null) {
                fieldValueRepository.save(fieldValue);
            }
        }

        // Send confirmation email
        String recipientEmail = student.getEmail();
        // Look for an email address in custom fields
        for (Map.Entry<String, String> entry : request.getFieldValues().entrySet()) {
            String value = entry.getValue();
            if (value != null && value.contains("@") && value.contains(".")) {
                recipientEmail = value;
                break; // Use the first one found
            }
        }

        emailService.sendApplicationConfirmation(
                recipientEmail,
                student.getFullName(),
                job.getCompanyName(),
                job.getJobRole());

        return getApplicationById(savedApplication.getId());
    }

    public List<ApplicationResponse> getApplicationsByJob(Long jobId, String department) {
        List<JobApplication> applications = applicationRepository.findByJobId(jobId);

        if (department != null && !department.isEmpty()) {
            applications = applications.stream()
                    .filter(app -> app.getStudent().getDepartment().equalsIgnoreCase(department))
                    .collect(Collectors.toList());
        }

        return applications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsByStudent(String username) {
        StudentProfile student = studentProfileRepository.findByUserId(
                getUserIdByUsername(username))
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<JobApplication> applications = applicationRepository.findByStudentId(student.getId());
        return applications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ApplicationResponse getApplicationById(Long id) {
        JobApplication application = applicationRepository
                .findById(Objects.requireNonNull(id, "Application ID cannot be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        return mapToResponse(application);
    }

    public byte[] exportApplicationsToCSV(Long jobId, String department) {
        List<ApplicationResponse> applications = getApplicationsByJob(jobId, department);

        if (applications.isEmpty()) {
            throw new ResourceNotFoundException("No applications found for this job");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
                OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
                CSVWriter writer = new CSVWriter(osw)) {

            // Get all unique field names
            Map<String, String> allFieldNames = applications.get(0).getFieldValues();

            // Write header
            String[] header = new String[6 + allFieldNames.size()];
            header[0] = "Application ID";
            header[1] = "Student Name";
            header[2] = "Student Email";
            header[3] = "Status";
            header[4] = "Applied At";
            header[5] = "Resume/Files Links";

            int index = 6;
            for (String fieldName : allFieldNames.keySet()) {
                header[index++] = fieldName;
            }
            writer.writeNext(header);

            // Write data rows
            for (ApplicationResponse app : applications) {
                String[] row = new String[6 + allFieldNames.size()];
                row[0] = app.getApplicationId().toString();
                row[1] = app.getStudentName();
                row[2] = app.getStudentEmail();
                row[3] = app.getApplicationStatus().toString();
                row[4] = app.getAppliedAt().toString();

                // Add download links
                StringBuilder links = new StringBuilder();
                if (app.getFileNames() != null) {
                    for (Map.Entry<String, String> entry : app.getFileNames().entrySet()) {
                        if (links.length() > 0)
                            links.append("; ");
                        links.append(entry.getKey()).append(": ")
                                .append("/api/files/download/").append(app.getApplicationId()).append("/")
                                .append(entry.getKey());
                    }
                }
                row[5] = links.toString();

                index = 6;
                for (String fieldName : allFieldNames.keySet()) {
                    row[index++] = app.getFieldValues().getOrDefault(fieldName, "");
                }
                writer.writeNext(row);
            }

            writer.flush();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }

    public byte[] exportApplicationsToZip(Long jobId, String department) {
        List<JobApplication> applications = applicationRepository.findByJobId(jobId);

        if (department != null && !department.isEmpty()) {
            applications = applications.stream()
                    .filter(app -> app.getStudent().getDepartment().equalsIgnoreCase(department))
                    .collect(Collectors.toList());
        }

        if (applications.isEmpty()) {
            throw new ResourceNotFoundException("No applications found for this job");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ZipOutputStream zos = new ZipOutputStream(baos)) {

            // 1. Add CSV file to ZIP
            byte[] csvData = exportApplicationsToCSV(jobId, department);
            ZipEntry csvEntry = new ZipEntry("applications_data.csv");
            zos.putNextEntry(csvEntry);
            zos.write(csvData);
            zos.closeEntry();

            // 2. Add individual files to ZIP
            for (JobApplication app : applications) {
                String studentName = app.getStudent().getFullName().replaceAll("[^a-zA-Z0-9.-]", "_");

                for (ApplicationFieldValue fv : app.getFieldValues()) {
                    if (fv.getFileData() != null && fv.getFileData().length > 0) {
                        String originalName = fv.getFileName() != null ? fv.getFileName() : "file";
                        String fieldName = fv.getFieldDefinition().getFieldName().replaceAll("[^a-zA-Z0-9.-]", "_");
                        String zipFileName = "resumes/" + studentName + "_" + app.getId() + "_" + fieldName + "_"
                                + originalName;

                        ZipEntry fileEntry = new ZipEntry(zipFileName);
                        zos.putNextEntry(fileEntry);
                        zos.write(fv.getFileData());
                        zos.closeEntry();
                    }
                }
            }

            zos.finish();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate ZIP export", e);
        }
    }

    private ApplicationResponse mapToResponse(JobApplication application) {
        Job job = application.getJob();
        StudentProfile student = application.getStudent();

        Map<String, String> fieldValues = new HashMap<>();
        Map<String, String> fileNames = new HashMap<>();
        for (ApplicationFieldValue value : application.getFieldValues()) {
            if (value.getFieldDefinition().getFieldType() == ApplicationFieldDefinition.FieldType.FILE) {
                fileNames.put(value.getFieldDefinition().getFieldName(), value.getFileName());
                fieldValues.put(value.getFieldDefinition().getFieldName(), "[FILE]");
            } else {
                fieldValues.put(value.getFieldDefinition().getFieldName(), value.getFieldValue());
            }
        }

        ApplicationResponse response = new ApplicationResponse();
        response.setApplicationId(application.getId());
        response.setJobId(job.getId());
        response.setCompanyName(job.getCompanyName());
        response.setJobRole(job.getJobRole());
        response.setApplicationStatus(application.getApplicationStatus());
        response.setAppliedAt(application.getAppliedAt());
        response.setFieldValues(fieldValues);
        response.setFileNames(fileNames);
        response.setStudentName(student.getFullName());
        response.setStudentEmail(student.getEmail());

        return response;
    }

    private Long getUserIdByUsername(String username) {
        // This is a helper method - in real implementation you'd inject UserRepository
        // For now, we'll handle it through StudentProfile relationship
        return studentProfileRepository.findAll().stream()
                .filter(sp -> sp.getUser().getUsername().equals(username))
                .findFirst()
                .map(sp -> sp.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
