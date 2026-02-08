package com.zastra.zastra.infra.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Address {

    @Column(nullable = false, length = 5)
    private String postalCode;

    @Column(nullable = false, length = 100)
    private String streetName;

    @Column(nullable = false, length = 20)
    private String houseNumber;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String province;

}


