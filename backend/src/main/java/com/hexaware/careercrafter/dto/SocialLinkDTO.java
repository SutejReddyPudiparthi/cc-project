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
public class SocialLinkDTO {

    private int id;

    @NotBlank(message = "Platform is required")
    private String platform;

    @Pattern(regexp = "https?://.+", message = "Invalid URL")
    private String url;
}
