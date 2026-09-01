package com.placement.portal.dto;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificationListRequest {

    @Valid
    private List<CertificationDto> certifications = new ArrayList<>();
}
