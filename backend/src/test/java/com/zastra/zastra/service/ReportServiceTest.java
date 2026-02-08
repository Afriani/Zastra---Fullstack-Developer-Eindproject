package com.zastra.zastra.service;

import com.zastra.zastra.infra.dto.StatusUpdateDTO;
import com.zastra.zastra.infra.entity.*;
import com.zastra.zastra.infra.enums.ReportStatus;
import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.infra.repository.*;
import com.zastra.zastra.infra.service.AppNotificationService;
import com.zastra.zastra.infra.service.FileStorageService;
import com.zastra.zastra.infra.service.ReportService;
import com.zastra.zastra.media.service.MediaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock private ReportRepository reportRepository;
    @Mock private UserRepository userRepository;
    @Mock private InboxItemRepository inboxItemRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private StatusUpdateRepository statusUpdateRepository;
    @Mock private ReportImageRepository reportImageRepository;
    @Mock private FileStorageService fileStorageService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private AppNotificationService appNotificationService;
    @Mock private MediaService mediaService;

    @InjectMocks
    private ReportService reportService;

    @Test
    void getReport_notFound_throws() {
        // Arrange
        when(reportRepository.findByIdWithHistory(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> reportService.getReportById(99L));
        verify(reportRepository).findByIdWithHistory(99L);
    }

    @Test
    void updateReportStatus_success() {
        // Arrange
        Long reportId = 1L;
        Report mockReport = new Report();
        mockReport.setId(reportId);
        mockReport.setTitle("Test Report");
        mockReport.setStatus(ReportStatus.SUBMITTED);

        User owner = new User();
        owner.setEmail("owner@example.com");
        mockReport.setUser(owner);

        when(reportRepository.findById(reportId)).thenReturn(Optional.of(mockReport));
        when(reportRepository.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        StatusUpdateDTO dto = new StatusUpdateDTO();
        dto.setStatus(ReportStatus.IN_PROGRESS);
        dto.setNotes("In progress");

        // Act
        var result = reportService.updateReportStatus(reportId, dto, "officer@example.com");

        // Assert
        assertEquals(ReportStatus.IN_PROGRESS, result.getStatus());
        verify(reportRepository).findById(reportId);
        verify(reportRepository).save(any(Report.class));

        // Notification calls: one to owner, one to admins (different method)
        verify(appNotificationService, times(1))
                .createNotification(eq(owner.getEmail()), anyString(), anyString(), anyString(), eq(reportId));
        verify(appNotificationService, times(1))
                .createNotificationsForAdmins(anyString(), anyString(), anyString(), eq(reportId));
    }

    @Test
    void updateReportStatusByOfficer_invalidTransition_throwsIllegalArgument() {
        // Arrange
        Long reportId = 2L;
        Report mockReport = new Report();
        mockReport.setId(reportId);
        mockReport.setTitle("Title");
        mockReport.setStatus(ReportStatus.RESOLVED); // terminal state -> invalid to go back

        when(reportRepository.findById(reportId)).thenReturn(Optional.of(mockReport));

        StatusUpdateDTO dto = new StatusUpdateDTO();
        dto.setStatus(ReportStatus.SUBMITTED);
        dto.setNotes("Trying to revert");

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> reportService.updateReportStatusByOfficer(reportId, dto, "officer@example.com"));
        verify(reportRepository).findById(reportId);
    }

}
