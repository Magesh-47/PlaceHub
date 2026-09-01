package com.placement.portal.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryUpdateRequest {

    @Size(max = 2000, message = "Summary must be 2000 characters or fewer")
    private String summary;
}
