package com.placement.portal.repository;

import com.placement.portal.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJobId(Long jobId);

    List<JobApplication> findByStudentId(Long studentId);

    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);
}
