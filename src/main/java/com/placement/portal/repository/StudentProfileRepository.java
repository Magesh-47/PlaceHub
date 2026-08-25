package com.placement.portal.repository;

import com.placement.portal.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);

    org.springframework.data.domain.Page<StudentProfile> findByDepartment(String department,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<StudentProfile> findByFullNameContainingIgnoreCase(String fullName,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<StudentProfile> findByFullNameContainingIgnoreCaseAndDepartment(
            String fullName, String department, org.springframework.data.domain.Pageable pageable);

    java.util.List<StudentProfile> findByDepartment(String department);

    boolean existsByEmail(String email);
}
