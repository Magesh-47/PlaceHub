package com.placement.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private StudentProfile student;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String issuingOrganization;

    private LocalDate issueDate;

    /** null means this credential does not expire */
    private LocalDate expiryDate;

    private String credentialUrl;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
