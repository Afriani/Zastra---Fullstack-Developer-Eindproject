package com.zastra.zastra.infra.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = NationalIdValidator.class)
@Target({ ElementType.TYPE })        // Applies to classes like RegisterRequest
@Retention(RetentionPolicy.RUNTIME)  // Keep at runtime

public @interface ValidNationalId {
    String message() default "Invalid National ID format for the given role";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

}
