package com.placement.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false, name = "study_year")
    private Integer year;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private Double cgpa;

    @Column
    private java.time.LocalDate dateOfBirth;

    @Column(length = 2000)
    private String summary;

    @Column(name = "profile_picture", columnDefinition = "bytea")
    @JdbcTypeCode(SqlTypes.BINARY)
    @JsonIgnore
    private byte[] profilePicture;

    @Column(name = "profile_picture_type")
    @JsonIgnore
    private String profilePictureType;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<JobApplication> applications = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @JsonIgnore
    private List<EducationEntry> education = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @JsonIgnore
    private List<ExperienceEntry> experience = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "student_skills", joinColumns = @JoinColumn(name = "student_id"))
    @OrderColumn(name = "skill_order")
    @Column(name = "skill", nullable = false)
    @JsonIgnore
    private List<String> skills = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @JsonIgnore
    private List<Certification> certifications = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @JsonIgnore
    private List<ProfileLink> links = new ArrayList<>();
}
