package com.placement.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatDto {
    private String department;
    private long totalStudents;
    private long appliedStudents;
    private long placedStudents;
    private double placementRate;
}
