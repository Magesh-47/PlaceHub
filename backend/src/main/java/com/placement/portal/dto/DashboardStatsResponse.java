package com.placement.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalStudents;
    private long totalJobs;
    private long activeJobs;
    private long totalApplications;
    private long placedStudents;
    private double overallPlacementRate;
    private Map<String, Long> statusBreakdown;
    private List<DepartmentStatDto> departmentStats;
}
