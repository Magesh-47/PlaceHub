package com.placement.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String department;
    private Integer year;
    private String phone;
    private Double cgpa;
    private java.time.LocalDate dateOfBirth;
}
