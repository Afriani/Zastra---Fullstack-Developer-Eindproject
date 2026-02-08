package com.zastra.zastra.infra.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateUserProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name cannot exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    // ✅ Optional fields - can be cleared with empty string
    @Pattern(regexp = "^(\\+?[1-9]\\d{7,14})?$", message = "Invalid phone number format")
    private String phoneNumber;

    @Pattern(regexp = "^(Male|Female|Other)?$", message = "Gender must be Male, Female, or Other")
    private String gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    // ✅ Address fields - can be cleared with empty string
    @Pattern(regexp = "^(\\d{5})?$", message = "Postal code must be exactly 5 digits")
    private String postalCode;

    @Size(max = 100, message = "Street name cannot exceed 100 characters")
    private String streetName;

    @Size(max = 20, message = "House number cannot exceed 20 characters")
    private String houseNumber;

    @Size(max = 50, message = "City cannot exceed 50 characters")
    private String city; // ✅ Added

    @Size(max = 50, message = "Province cannot exceed 50 characters")
    private String province; // ✅ Added

    // ✅ Optional password change
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

}


