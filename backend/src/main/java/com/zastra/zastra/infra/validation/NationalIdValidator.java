package com.zastra.zastra.infra.validation;

import com.zastra.zastra.infra.dto.RegisterRequest;
import com.zastra.zastra.infra.enums.UserRole;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NationalIdValidator implements ConstraintValidator<ValidNationalId, RegisterRequest> {

    @Override
    public boolean isValid(RegisterRequest request, ConstraintValidatorContext context) {
        if (request == null) return true;

        String nationalId = request.getNationalId();
        if (nationalId == null || nationalId.isBlank()) {
            return false;
        }

        // Derive role purely from National ID pattern
        UserRole derivedRole = null;

        if (nationalId.matches("^ADM\\d{10,}$")) {
            derivedRole = UserRole.ADMIN;
        } else if (nationalId.matches("^OFI\\d{10,}$")) {
            derivedRole = UserRole.OFFICER;
        } else if (nationalId.matches("^\\d{16}$")) {
            derivedRole = UserRole.CITIZEN;
        }

        if (derivedRole == null) {
            // invalid format, reject
            return false;
        }

        // Optional: Check consistency if client also provided a role
        if (request.getUserRole() != null && request.getUserRole() != derivedRole) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                            "Provided userRole (" + request.getUserRole() +
                                    ") does not match NationalId pattern (" + derivedRole + ")")
                    .addConstraintViolation();
            return false;
        }

        // ✅ Validation passed
        return true;
    }

}


