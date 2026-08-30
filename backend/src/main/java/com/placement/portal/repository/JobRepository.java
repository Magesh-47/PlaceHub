package com.placement.portal.repository;

import com.placement.portal.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Page<Job> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.isActive = true " +
            "AND (:keyword IS NULL OR :keyword = '' " +
            "     OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(j.jobRole) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:location IS NULL OR :location = '' " +
            "     OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    Page<Job> searchActiveJobs(@Param("keyword") String keyword, @Param("location") String location,
            Pageable pageable);
}
