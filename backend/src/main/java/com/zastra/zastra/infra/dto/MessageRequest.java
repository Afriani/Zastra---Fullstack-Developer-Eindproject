package com.zastra.zastra.infra.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter @Setter
public class MessageRequest {

    @NotNull(message = "Report ID is required")
    private Long reportId;

    @NotBlank(message = "Message content is required")
    private String content;

}


