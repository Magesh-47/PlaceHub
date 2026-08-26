package com.placement.portal.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Job role is required")
    private String jobRole;

    private String description;

    private String eligibilityCriteria;

    private String location;

    private String salaryPackage;

    @NotNull(message = "Application deadline is required")
    private LocalDate applicationDeadline;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    @Valid
    private List<CustomFieldDto> customFields = new ArrayList<>();
}
