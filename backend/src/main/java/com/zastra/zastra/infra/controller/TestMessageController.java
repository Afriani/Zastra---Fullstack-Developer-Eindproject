package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.MessageRequest;
import com.zastra.zastra.infra.entity.Message;
import com.zastra.zastra.infra.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestMessageController {

    private static final Logger log = LoggerFactory.getLogger(TestMessageController.class);

    @Autowired
    private MessageService messageService;

    @PostMapping("/send-message")
    public ResponseEntity<String> testSendMessage(@RequestBody MessageRequest messageRequest) {
        String testSenderEmail = "eva.green@zastra.com"; // or any valid sender email
        log.info("Test: Calling sendMessage with senderEmail={} and reportId={}", testSenderEmail, messageRequest.getReportId());
        try {
            Message message = messageService.sendMessage(messageRequest, testSenderEmail);
            log.info("Test: sendMessage succeeded with message id={}", message.getId());
            return ResponseEntity.ok("Message sent with id: " + message.getId());
        } catch (Exception e) {
            log.error("Test: sendMessage failed", e);
            return ResponseEntity.status(500).body("Failed to send message: " + e.getMessage());
        }
    }

}


