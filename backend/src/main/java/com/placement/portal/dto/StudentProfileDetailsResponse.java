package com.placement.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDetailsResponse {
    private String summary;
    private List<EducationDto> education = new ArrayList<>();
    private List<ExperienceDto> experience = new ArrayList<>();
    private List<String> skills = new ArrayList<>();
    private List<CertificationDto> certifications = new ArrayList<>();
    private List<ProfileLinkDto> links = new ArrayList<>();
}
