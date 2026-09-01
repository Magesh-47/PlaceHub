package com.placement.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profile_links")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private StudentProfile student;

    /** e.g. "Portfolio", "GitHub", "LinkedIn", or a custom label */
    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String url;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
