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
public class ProjectDTO {

    private int id;

    @NotBlank(message = "Project name is required")
    private String projectName;

    @NotBlank(message = "Description is required")
    private String description;

    @Pattern(regexp = "(https?://.*)?", message = "Invalid project link")
    private String link;
}
