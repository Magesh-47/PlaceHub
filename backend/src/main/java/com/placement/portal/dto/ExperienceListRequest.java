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
public class ExperienceListRequest {

    @Valid
    private List<ExperienceDto> experience = new ArrayList<>();
}
