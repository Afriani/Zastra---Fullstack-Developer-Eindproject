package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.InboxDTO;
import com.zastra.zastra.infra.entity.InboxItem;
import com.zastra.zastra.infra.repository.InboxItemRepository;
import com.zastra.zastra.infra.service.ReportService;
import com.zastra.zastra.infra.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/officer")
@RequiredArgsConstructor
public class OfficerInboxController {

    private final InboxItemRepository inboxItemRepository;
    private final ReportService reportService;
    private final UserService userService;

    @GetMapping("/inbox")
    public List<InboxDTO> getInbox(Principal principal) {
        String email = principal.getName();
        List<InboxItem> items = inboxItemRepository.findByOfficer_EmailOrderByCreatedAtDesc(email);
        return items.stream().map(this::toDto).collect(Collectors.toList());
    }

    @PostMapping("/inbox/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, Principal principal) {
        String email = principal.getName();
        InboxItem item = inboxItemRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!item.getOfficer().getEmail().equals(email)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        item.setRead(true);
        inboxItemRepository.save(item);
        return ResponseEntity.ok().build();
    }

    private InboxDTO toDto(InboxItem item) {
        return InboxDTO.builder()
                .id(item.getId())
                .reportId(item.getReport() != null ? item.getReport().getId() : null)
                .reportTitle(item.getReport() != null ? item.getReport().getTitle() : null)
                .message(item.getMessage())
                .createdAt(item.getCreatedAt())
                .read(item.isRead())
                .build();
    }

}



