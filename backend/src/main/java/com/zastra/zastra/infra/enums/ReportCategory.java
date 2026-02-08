package com.zastra.zastra.infra.enums;

import lombok.Getter;

@Getter
public enum ReportCategory {

    ROAD_DAMAGE("Road Damage"),
    LITTER("Litter"),
    BROKEN_STREETLIGHT("Broken Streetlight"),
    GRAFFITI("Graffiti"),
    DAMAGED_SIGN("Damaged Sign"),
    FALLEN_TREE("Fallen Tree"),
    POTHOLE("Pothole"),
    BROKEN_BENCH("Broken Bench"),
    DAMAGED_PLAYGROUND("Damaged Playground"),
    ILLEGAL_DUMPING("Illegal Dumping"),
    OTHER("Other");

    private final String displayName;

    ReportCategory(String displayName) {
        this.displayName = displayName;
    }

}


