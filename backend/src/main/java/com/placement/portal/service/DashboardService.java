package com.placement.portal.service;

import com.placement.portal.dto.DashboardStatsResponse;
import com.placement.portal.dto.DepartmentStatDto;
import com.placement.portal.entity.Job;
import com.placement.portal.entity.JobApplication;
import com.placement.portal.entity.StudentProfile;
import com.placement.portal.repository.JobApplicationRepository;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        List<StudentProfile> students = studentProfileRepository.findAll();
        List<Job> jobs = jobRepository.findAll();
        List<JobApplication> applications = applicationRepository.findAll();

        Map<Long, List<JobApplication>> applicationsByStudentId = applications.stream()
                .collect(Collectors.groupingBy(a -> a.getStudent().getId()));

        Map<String, Long> statusBreakdown = applications.stream()
                .collect(Collectors.groupingBy(a -> a.getApplicationStatus().name(), Collectors.counting()));

        List<DepartmentStatDto> departmentStats = students.stream()
                .collect(Collectors.groupingBy(StudentProfile::getDepartment))
                .entrySet().stream()
                .map(entry -> buildDepartmentStat(entry.getKey(), entry.getValue(), applicationsByStudentId))
                .sorted(Comparator.comparing(DepartmentStatDto::getDepartment))
                .collect(Collectors.toList());

        long placedStudents = students.stream()
                .filter(s -> hasAcceptedApplication(applicationsByStudentId.get(s.getId())))
                .count();

        long activeJobs = jobs.stream().filter(Job::getIsActive).count();

        return new DashboardStatsResponse(
                students.size(),
                jobs.size(),
                activeJobs,
                applications.size(),
                placedStudents,
                placementRate(placedStudents, students.size()),
                statusBreakdown,
                departmentStats);
    }

    private DepartmentStatDto buildDepartmentStat(String department, List<StudentProfile> deptStudents,
            Map<Long, List<JobApplication>> applicationsByStudentId) {
        long total = deptStudents.size();
        long applied = deptStudents.stream()
                .filter(s -> applicationsByStudentId.containsKey(s.getId()))
                .count();
        long placed = deptStudents.stream()
                .filter(s -> hasAcceptedApplication(applicationsByStudentId.get(s.getId())))
                .count();

        return new DepartmentStatDto(department, total, applied, placed, placementRate(placed, total));
    }

    private boolean hasAcceptedApplication(List<JobApplication> applications) {
        return applications != null && applications.stream()
                .anyMatch(a -> a.getApplicationStatus() == JobApplication.ApplicationStatus.ACCEPTED);
    }

    private double placementRate(long placed, long total) {
        if (total == 0) {
            return 0.0;
        }
        return Math.round(placed * 1000.0 / total) / 10.0;
    }
}
