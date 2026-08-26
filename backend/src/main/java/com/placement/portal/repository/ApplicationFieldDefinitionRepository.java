package com.placement.portal.repository;

import com.placement.portal.entity.ApplicationFieldDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationFieldDefinitionRepository extends JpaRepository<ApplicationFieldDefinition, Long> {
    List<ApplicationFieldDefinition> findByJobIdOrderByDisplayOrderAsc(Long jobId);
}
