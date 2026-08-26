package com.placement.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private Long id;
    private String companyName;
    private String jobRole;
    private String description;
    private String eligibilityCriteria;
    private String location;
    private String salaryPackage;
    private LocalDate applicationDeadline;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<CustomFieldDto> customFields = new ArrayList<>();
}
