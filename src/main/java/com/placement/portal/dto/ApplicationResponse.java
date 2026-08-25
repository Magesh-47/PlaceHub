package com.placement.portal.dto;

import com.placement.portal.entity.JobApplication;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long applicationId;
    private Long jobId;
    private String companyName;
    private String jobRole;
    private JobApplication.ApplicationStatus applicationStatus;
    private LocalDateTime appliedAt;
    private Map<String, String> fieldValues = new HashMap<>();
    private Map<String, String> fileNames = new HashMap<>();
    private String studentName;
    private String studentEmail;
}
