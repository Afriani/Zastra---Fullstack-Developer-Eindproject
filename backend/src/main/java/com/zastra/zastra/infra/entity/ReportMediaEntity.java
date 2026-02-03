package com.zastra.zastra.infra.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_media_entity")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportMediaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;
    private boolean video; // true if video, false if picture

    @ManyToOne
    @JoinColumn(name = "report_id")
    private Report report;

}


