package com.zastra.zastra.infra.enums;

import lombok.Getter;

@Getter
public enum UserRole {

    CITIZEN("Citizen"),
    OFFICER("Municipal Officer"),
    ADMIN("Administrator");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

}

