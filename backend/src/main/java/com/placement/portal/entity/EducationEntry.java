package com.placement.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "education_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private StudentProfile student;

    @Column(nullable = false)
    private String institution;

    @Column(nullable = false)
    private String degree;

    private String fieldOfStudy;

    private Integer startYear;

    private Integer endYear;

    private String gradeOrScore;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
