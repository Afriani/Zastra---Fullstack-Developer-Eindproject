package com.zastra.zastra.infra.dto;

import lombok.Data;

@Data
public class ConversationRequest {

    private Long conversationId;   // if null, start new
    private String recipientEmail; // required for new
    private Long reportId;         // optional
    private String subject;        // optional for new
    private String content;        // required

}


