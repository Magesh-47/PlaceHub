package com.placement.portal.repository;

import com.placement.portal.entity.ApplicationFieldValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationFieldValueRepository extends JpaRepository<ApplicationFieldValue, Long> {
}
