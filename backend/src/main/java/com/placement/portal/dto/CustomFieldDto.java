package com.placement.portal.dto;

import com.placement.portal.entity.ApplicationFieldDefinition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomFieldDto {

    private Long id;

    @NotBlank(message = "Field name is required")
    private String fieldName;

    @NotNull(message = "Field type is required")
    private ApplicationFieldDefinition.FieldType fieldType;

    @NotNull(message = "isRequired flag is required")
    private Boolean isRequired;

    private Integer displayOrder;
}
