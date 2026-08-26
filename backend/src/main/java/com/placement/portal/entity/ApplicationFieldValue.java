package com.placement.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "application_field_values")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationFieldValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnore
    private JobApplication application;

    @ManyToOne
    @JoinColumn(name = "field_definition_id", nullable = false)
    @JsonIgnore
    private ApplicationFieldDefinition fieldDefinition;

    @Column(length = 2000, nullable = true)
    private String fieldValue;

    @Column(name = "file_data", columnDefinition = "bytea")
    @JdbcTypeCode(SqlTypes.BINARY)
    private byte[] fileData;

    private String fileName;

    private String fileType;
}
