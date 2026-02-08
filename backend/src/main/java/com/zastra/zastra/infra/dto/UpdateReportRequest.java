package com.zastra.zastra.infra.dto;

import com.zastra.zastra.infra.enums.ReportCategory;
import jakarta.validation.Valid;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class UpdateReportRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private ReportCategory category;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @Valid
    @NotNull(message="Address is required")
    private AddressDto address;

}



