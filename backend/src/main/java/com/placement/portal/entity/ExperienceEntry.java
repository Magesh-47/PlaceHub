package com.placement.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "experience_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private StudentProfile student;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String role;

    private LocalDate startDate;

    /** null means this is the student's current role */
    private LocalDate endDate;

    @Column(length = 2000)
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
