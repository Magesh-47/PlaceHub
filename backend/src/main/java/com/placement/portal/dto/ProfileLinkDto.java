package com.placement.portal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileLinkDto {
    private Long id;

    @NotBlank(message = "Label is required")
    private String label;

    @NotBlank(message = "URL is required")
    private String url;
}
