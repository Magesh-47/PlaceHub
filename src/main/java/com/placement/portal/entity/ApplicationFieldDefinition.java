package com.placement.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "application_field_definitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationFieldDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fieldName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldType fieldType;

    @Column(nullable = false)
    private Boolean isRequired = true;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    @JsonIgnore
    private Job job;

    @OneToMany(mappedBy = "fieldDefinition", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ApplicationFieldValue> fieldValues = new ArrayList<>();

    public enum FieldType {
        TEXT,
        TEXTAREA,
        URL,
        NUMBER,
        DATE,
        EMAIL,
        PHONE,
        FILE
    }
}
