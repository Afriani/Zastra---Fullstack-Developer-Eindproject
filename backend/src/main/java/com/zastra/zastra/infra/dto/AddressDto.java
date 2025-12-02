package com.zastra.zastra.infra.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressDto {

    @NotBlank(message = "Street name is required")
    private String streetName;

    private String houseNumber;   // may be null if reverse geocode didn't provide it

    private String postalCode;

    @NotBlank(message = "City is required")
    private String city;

    private String province;

    private String country;

}
