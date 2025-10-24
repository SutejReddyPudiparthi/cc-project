package com.hexaware.careercrafter.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EducationDTO {

    private int id;

    @NotBlank(message = "Level is required")
    private String level;

    @NotBlank(message = "Institution name is required")
    private String institutionName;

    @NotBlank(message = "Stream is required")
    private String stream;

    @NotBlank(message = "Start year is required")
    private int startYear;

    @NotBlank(message = "End year is required")
    private int endYear;

    @NotBlank(message = "Location is required")
    private String location;
}
