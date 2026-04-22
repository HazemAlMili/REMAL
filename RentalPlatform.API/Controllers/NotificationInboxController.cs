using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.NotificationInbox;
using RentalPlatform.API.DTOs.Responses.NotificationInbox;
using RentalPlatform.API.DTOs.Responses.Notifications;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.API.Controllers;

[ApiController]
public class NotificationInboxController : ControllerBase
{
    private readonly INotificationInboxService _inboxService;

    public NotificationInboxController(INotificationInboxService inboxService)
    {
        _inboxService = inboxService;
    }

    // -------------------------------------------------------------------------
    // Admin scope
    // -------------------------------------------------------------------------

    // GET /api/internal/me/notifications/inbox
    [HttpGet("api/internal/me/notifications/inbox")]
    [Authorize(Policy = "AdminAuthenticated")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationListItemResponse>>>> GetAdminInbox(
        [FromQuery] GetInboxRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        var items = await _inboxService.GetAdminInboxAsync(
            adminId, request.UnreadOnly, request.Page, request.PageSize, cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<NotificationListItemResponse>>.CreateSuccess(
            items.Select(MapToListItemResponse).ToList()));
    }

    // GET /api/internal/me/notifications/inbox/summary
    [HttpGet("api/internal/me/notifications/inbox/summary")]
    [Authorize(Policy = "AdminAuthenticated")]
    public async Task<ActionResult<ApiResponse<NotificationRecipientInboxSummaryResponse>>> GetAdminInboxSummary(
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        var summary = await _inboxService.GetAdminInboxSummaryAsync(adminId, cancellationToken);
        return Ok(ApiResponse<NotificationRecipientInboxSummaryResponse>.CreateSuccess(
            MapToSummaryResponse(summary)));
    }

    // POST /api/internal/me/notifications/inbox/{notificationId}/read
    [HttpPost("api/internal/me/notifications/inbox/{notificationId}/read")]
    [Authorize(Policy = "AdminAuthenticated")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> MarkAdminRead(
        Guid notificationId,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        var notification = await _inboxService.MarkAdminReadAsync(notificationId, adminId, cancellationToken);
        return Ok(ApiResponse<NotificationResponse>.CreateSuccess(
            MapToNotificationResponse(notification), "Notification marked as read."));
    }

    // -------------------------------------------------------------------------
    // Client scope
    // -------------------------------------------------------------------------

    // GET /api/client/me/notifications/inbox
    [HttpGet("api/client/me/notifications/inbox")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationListItemResponse>>>> GetClientInbox(
        [FromQuery] GetInboxRequest request,
        CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();
        var items = await _inboxService.GetClientInboxAsync(
            clientId, request.UnreadOnly, request.Page, request.PageSize, cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<NotificationListItemResponse>>.CreateSuccess(
            items.Select(MapToListItemResponse).ToList()));
    }

    // GET /api/client/me/notifications/inbox/summary
    [HttpGet("api/client/me/notifications/inbox/summary")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<ActionResult<ApiResponse<NotificationRecipientInboxSummaryResponse>>> GetClientInboxSummary(
        CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();
        var summary = await _inboxService.GetClientInboxSummaryAsync(clientId, cancellationToken);
        return Ok(ApiResponse<NotificationRecipientInboxSummaryResponse>.CreateSuccess(
            MapToSummaryResponse(summary)));
    }

    // POST /api/client/me/notifications/inbox/{notificationId}/read
    [HttpPost("api/client/me/notifications/inbox/{notificationId}/read")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> MarkClientRead(
        Guid notificationId,
        CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();
        var notification = await _inboxService.MarkClientReadAsync(notificationId, clientId, cancellationToken);
        return Ok(ApiResponse<NotificationResponse>.CreateSuccess(
            MapToNotificationResponse(notification), "Notification marked as read."));
    }

    // -------------------------------------------------------------------------
    // Owner scope
    // -------------------------------------------------------------------------

    // GET /api/owner/me/notifications/inbox
    [HttpGet("api/owner/me/notifications/inbox")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationListItemResponse>>>> GetOwnerInbox(
        [FromQuery] GetInboxRequest request,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();
        var items = await _inboxService.GetOwnerInboxAsync(
            ownerId, request.UnreadOnly, request.Page, request.PageSize, cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<NotificationListItemResponse>>.CreateSuccess(
            items.Select(MapToListItemResponse).ToList()));
    }

    // GET /api/owner/me/notifications/inbox/summary
    [HttpGet("api/owner/me/notifications/inbox/summary")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<ActionResult<ApiResponse<NotificationRecipientInboxSummaryResponse>>> GetOwnerInboxSummary(
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();
        var summary = await _inboxService.GetOwnerInboxSummaryAsync(ownerId, cancellationToken);
        return Ok(ApiResponse<NotificationRecipientInboxSummaryResponse>.CreateSuccess(
            MapToSummaryResponse(summary)));
    }

    // POST /api/owner/me/notifications/inbox/{notificationId}/read
    [HttpPost("api/owner/me/notifications/inbox/{notificationId}/read")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> MarkOwnerRead(
        Guid notificationId,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();
        var notification = await _inboxService.MarkOwnerReadAsync(notificationId, ownerId, cancellationToken);
        return Ok(ApiResponse<NotificationResponse>.CreateSuccess(
            MapToNotificationResponse(notification), "Notification marked as read."));
    }

    // -------------------------------------------------------------------------
    // Identity helpers
    // -------------------------------------------------------------------------

    private Guid GetCurrentAdminId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var id))
            throw new UnauthorizedBusinessException("Current admin ID not found in claims.");
        return id;
    }

    private Guid GetCurrentClientId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var id))
            throw new UnauthorizedBusinessException("Current client ID not found in claims.");
        return id;
    }

    private Guid GetCurrentOwnerId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var id))
            throw new UnauthorizedBusinessException("Current owner ID not found in claims.");
        return id;
    }

    // -------------------------------------------------------------------------
    // Mapping
    // -------------------------------------------------------------------------

    private static NotificationListItemResponse MapToListItemResponse(NotificationListItemResult r) => new(
        NotificationId: r.NotificationId,
        Channel: r.Channel,
        NotificationStatus: r.NotificationStatus,
        Subject: r.Subject,
        Body: r.Body,
        CreatedAt: r.CreatedAt,
        SentAt: r.SentAt,
        ReadAt: r.ReadAt
    );

    private static NotificationRecipientInboxSummaryResponse MapToSummaryResponse(
        NotificationRecipientInboxSummaryResult r) => new(
        TotalCount: r.TotalCount,
        UnreadCount: r.UnreadCount
    );

    private static NotificationResponse MapToNotificationResponse(Notification n) => new(
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
}
