package com.placement.portal.service;

import com.placement.portal.dto.CustomFieldDto;
import com.placement.portal.dto.JobRequest;
import com.placement.portal.dto.JobResponse;
import com.placement.portal.entity.ApplicationFieldDefinition;
import com.placement.portal.entity.Job;
import com.placement.portal.exception.ResourceNotFoundException;
import com.placement.portal.repository.ApplicationFieldDefinitionRepository;
import com.placement.portal.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationFieldDefinitionRepository fieldDefinitionRepository;

    @Transactional
    public JobResponse createJob(JobRequest request) {
        Job job = new Job();
        job.setCompanyName(request.getCompanyName());
        job.setJobRole(request.getJobRole());
        job.setDescription(request.getDescription());
        job.setEligibilityCriteria(request.getEligibilityCriteria());
        job.setLocation(request.getLocation());
        job.setSalaryPackage(request.getSalaryPackage());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setIsActive(request.getIsActive());

        Job savedJob = jobRepository.save(job);

        // Create custom fields
        if (request.getCustomFields() != null && !request.getCustomFields().isEmpty()) {
            for (CustomFieldDto fieldDto : request.getCustomFields()) {
                ApplicationFieldDefinition field = new ApplicationFieldDefinition();
                field.setFieldName(fieldDto.getFieldName());
                field.setFieldType(fieldDto.getFieldType());
                field.setIsRequired(fieldDto.getIsRequired());
                field.setDisplayOrder(fieldDto.getDisplayOrder() != null ? fieldDto.getDisplayOrder() : 0);
                field.setJob(savedJob);

                fieldDefinitionRepository.save(field);
            }
        }

        return getJobById(savedJob.getId());
    }

    public JobResponse getJobById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Job ID cannot be null");
        }

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        return mapToResponse(job);
    }

    public Page<JobResponse> getAllJobs(Pageable pageable) {
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }

        return jobRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    public Page<JobResponse> getActiveJobs(Pageable pageable) {
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }

        return jobRepository.findByIsActiveTrue(pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public JobResponse updateJob(Long id, JobRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("Job ID cannot be null");
        }

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        job.setCompanyName(request.getCompanyName());
        job.setJobRole(request.getJobRole());
        job.setDescription(request.getDescription());
        job.setEligibilityCriteria(request.getEligibilityCriteria());
        job.setLocation(request.getLocation());
        job.setSalaryPackage(request.getSalaryPackage());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setIsActive(request.getIsActive());

        // Delete existing custom fields and create new ones
        List<ApplicationFieldDefinition> existingFields = fieldDefinitionRepository
                .findByJobIdOrderByDisplayOrderAsc(id);
        if (existingFields != null && !existingFields.isEmpty()) {
            fieldDefinitionRepository.deleteAll(existingFields);
        }

        if (request.getCustomFields() != null && !request.getCustomFields().isEmpty()) {
            for (CustomFieldDto fieldDto : request.getCustomFields()) {
                ApplicationFieldDefinition field = new ApplicationFieldDefinition();
                field.setFieldName(fieldDto.getFieldName());
                field.setFieldType(fieldDto.getFieldType());
                field.setIsRequired(fieldDto.getIsRequired());
                field.setDisplayOrder(fieldDto.getDisplayOrder() != null ? fieldDto.getDisplayOrder() : 0);
                field.setJob(job);

                fieldDefinitionRepository.save(field);
            }
        }

        jobRepository.save(job);
        return getJobById(id);
    }

    @Transactional
    public void deleteJob(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Job ID cannot be null");
        }

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        jobRepository.delete(java.util.Objects.requireNonNull(job));
    }

    private JobResponse mapToResponse(Job job) {
        List<CustomFieldDto> customFields = fieldDefinitionRepository
                .findByJobIdOrderByDisplayOrderAsc(job.getId())
                .stream()
                .map(field -> new CustomFieldDto(
                        field.getId(),
                        field.getFieldName(),
                        field.getFieldType(),
                        field.getIsRequired(),
                        field.getDisplayOrder()))
                .collect(Collectors.toList());

        return new JobResponse(
                job.getId(),
                job.getCompanyName(),
                job.getJobRole(),
                job.getDescription(),
                job.getEligibilityCriteria(),
                job.getLocation(),
                job.getSalaryPackage(),
                job.getApplicationDeadline(),
                job.getIsActive(),
                job.getCreatedAt(),
                customFields);
    }
}
