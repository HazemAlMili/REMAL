using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.NotificationDispatch;
using RentalPlatform.API.DTOs.Responses.NotificationDispatch;
using RentalPlatform.API.DTOs.Responses.Notifications;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Authorize(Policy = "AdminAuthenticated")]
public class NotificationDispatchController : ControllerBase
{
    private readonly INotificationDispatchService _dispatchService;

    public NotificationDispatchController(INotificationDispatchService dispatchService)
    {
        _dispatchService = dispatchService;
    }

    // POST /api/internal/notifications/{notificationId}/queue
    [HttpPost("api/internal/notifications/{notificationId}/queue")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> Queue(
        Guid notificationId,
        [FromBody] QueueNotificationRequest request,
        CancellationToken cancellationToken)
    {
        var notification = await _dispatchService.QueueAsync(notificationId, cancellationToken);

        return Ok(ApiResponse<NotificationResponse>.CreateSuccess(
            MapToResponse(notification), "Notification queued successfully."));
    }

    // POST /api/internal/notifications/{notificationId}/mark-sent
    [HttpPost("api/internal/notifications/{notificationId}/mark-sent")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> MarkSent(
        Guid notificationId,
        [FromBody] MarkNotificationSentRequest request,
        CancellationToken cancellationToken)
    {
        var notification = await _dispatchService.MarkSentAsync(
            notificationId: notificationId,
            providerName: request.ProviderName,
            providerMessageId: request.ProviderMessageId,
            cancellationToken: cancellationToken);

        return Ok(ApiResponse<NotificationResponse>.CreateSuccess(
            MapToResponse(notification), "Notification marked as sent."));
    }

    // POST /api/internal/notifications/{notificationId}/mark-delivered
    [HttpPost("api/internal/notifications/{notificationId}/mark-delivered")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> MarkDelivered(
        Guid notificationId,
        [FromBody] MarkNotificationDeliveredRequest request,
        CancellationToken cancellationToken)
    {
        var notification = await _dispatchService.MarkDeliveredAsync(
            notificationId: notificationId,
            providerName: request.ProviderName,
            providerMessageId: request.ProviderMessageId,
            cancellationToken: cancellationToken);

        return Ok(ApiResponse<NotificationResponse>.CreateSuccess(
            MapToResponse(notification), "Notification marked as delivered."));
    }

    // POST /api/internal/notifications/{notificationId}/mark-failed
    [HttpPost("api/internal/notifications/{notificationId}/mark-failed")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> MarkFailed(
        Guid notificationId,
        [FromBody] MarkNotificationFailedRequest request,
        CancellationToken cancellationToken)
    {
        var notification = await _dispatchService.MarkFailedAsync(
            notificationId: notificationId,
            errorMessage: request.ErrorMessage,
            providerName: request.ProviderName,
            providerMessageId: request.ProviderMessageId,
            cancellationToken: cancellationToken);

        return Ok(ApiResponse<NotificationResponse>.CreateSuccess(
            MapToResponse(notification), "Notification marked as failed."));
    }

    // POST /api/internal/notifications/{notificationId}/cancel
    [HttpPost("api/internal/notifications/{notificationId}/cancel")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> Cancel(
        Guid notificationId,
        [FromBody] CancelNotificationRequest request,
        CancellationToken cancellationToken)
    {
        var notification = await _dispatchService.CancelAsync(notificationId, cancellationToken);

        return Ok(ApiResponse<NotificationResponse>.CreateSuccess(
            MapToResponse(notification), "Notification cancelled successfully."));
    }

    // GET /api/internal/notifications/{notificationId}/delivery-logs
    [HttpGet("api/internal/notifications/{notificationId}/delivery-logs")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationDeliveryLogResponse>>>> GetDeliveryLogs(
        Guid notificationId,
        CancellationToken cancellationToken)
    {
        var logs = await _dispatchService.GetDeliveryLogsAsync(notificationId, cancellationToken);

        var mapped = logs.Select(MapToLogResponse).ToList();

        return Ok(ApiResponse<IReadOnlyList<NotificationDeliveryLogResponse>>.CreateSuccess(mapped));
    }

    // -------------------------------------------------------------------------
    // Mapping
    // -------------------------------------------------------------------------

    private static NotificationResponse MapToResponse(Notification n) => new(
        Id: n.Id,
        TemplateId: n.TemplateId,
        AdminUserId: n.AdminUserId,
        ClientId: n.ClientId,
        OwnerId: n.OwnerId,
        Channel: n.Channel,
        NotificationStatus: n.NotificationStatus,
        Subject: n.Subject,
        Body: n.Body,
        ScheduledAt: n.ScheduledAt,
        SentAt: n.SentAt,
        ReadAt: n.ReadAt,
        CreatedAt: n.CreatedAt,
        UpdatedAt: n.UpdatedAt
    );

    private static NotificationDeliveryLogResponse MapToLogResponse(NotificationDeliveryLog log) => new(
        Id: log.Id,
        NotificationId: log.NotificationId,
        AttemptNumber: log.AttemptNumber,
        DeliveryStatus: log.DeliveryStatus,
        ProviderName: log.ProviderName,
        ProviderMessageId: log.ProviderMessageId,
        ErrorMessage: log.ErrorMessage,
        AttemptedAt: log.AttemptedAt
    );
}
