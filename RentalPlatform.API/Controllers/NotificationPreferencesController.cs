using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.NotificationPreferences;
using RentalPlatform.API.DTOs.Responses.NotificationPreferences;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.API.Controllers;

[ApiController]
public class NotificationPreferencesController : ControllerBase
{
    private readonly INotificationPreferenceService _preferenceService;

    public NotificationPreferencesController(INotificationPreferenceService preferenceService)
    {
        _preferenceService = preferenceService;
    }

    // -------------------------------------------------------------------------
    // Admin scope
    // -------------------------------------------------------------------------

    // GET /api/internal/me/notification-preferences
    [HttpGet("api/internal/me/notification-preferences")]
    [Authorize(Policy = "AdminAuthenticated")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationPreferenceResponse>>>> GetAdminPreferences(
        [FromQuery] string? channel,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        var prefs = await _preferenceService.GetForAdminAsync(adminId, channel, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<NotificationPreferenceResponse>>.CreateSuccess(
            prefs.Select(MapToResponse).ToList()));
    }

    // PUT /api/internal/me/notification-preferences
    [HttpPut("api/internal/me/notification-preferences")]
    [Authorize(Policy = "AdminAuthenticated")]
    public async Task<ActionResult<ApiResponse<NotificationPreferenceResponse>>> UpsertAdminPreference(
        [FromBody] UpsertNotificationPreferenceRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        var pref = await _preferenceService.UpsertForAdminAsync(
            adminUserId: adminId,
            channel: request.Channel,
            preferenceKey: request.PreferenceKey,
            isEnabled: request.IsEnabled,
            cancellationToken: cancellationToken);

        return Ok(ApiResponse<NotificationPreferenceResponse>.CreateSuccess(
            MapToResponse(pref), "Preference updated successfully."));
    }

    // -------------------------------------------------------------------------
    // Client scope
    // -------------------------------------------------------------------------

    // GET /api/client/me/notification-preferences
    [HttpGet("api/client/me/notification-preferences")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationPreferenceResponse>>>> GetClientPreferences(
        [FromQuery] string? channel,
        CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();
        var prefs = await _preferenceService.GetForClientAsync(clientId, channel, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<NotificationPreferenceResponse>>.CreateSuccess(
            prefs.Select(MapToResponse).ToList()));
    }

    // PUT /api/client/me/notification-preferences
    [HttpPut("api/client/me/notification-preferences")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<ActionResult<ApiResponse<NotificationPreferenceResponse>>> UpsertClientPreference(
        [FromBody] UpsertNotificationPreferenceRequest request,
        CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();
        var pref = await _preferenceService.UpsertForClientAsync(
            clientId: clientId,
            channel: request.Channel,
            preferenceKey: request.PreferenceKey,
            isEnabled: request.IsEnabled,
            cancellationToken: cancellationToken);

        return Ok(ApiResponse<NotificationPreferenceResponse>.CreateSuccess(
            MapToResponse(pref), "Preference updated successfully."));
    }

    // -------------------------------------------------------------------------
    // Owner scope
    // -------------------------------------------------------------------------

    // GET /api/owner/me/notification-preferences
    [HttpGet("api/owner/me/notification-preferences")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationPreferenceResponse>>>> GetOwnerPreferences(
        [FromQuery] string? channel,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();
        var prefs = await _preferenceService.GetForOwnerAsync(ownerId, channel, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<NotificationPreferenceResponse>>.CreateSuccess(
            prefs.Select(MapToResponse).ToList()));
    }

    // PUT /api/owner/me/notification-preferences
    [HttpPut("api/owner/me/notification-preferences")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<ActionResult<ApiResponse<NotificationPreferenceResponse>>> UpsertOwnerPreference(
        [FromBody] UpsertNotificationPreferenceRequest request,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();
        var pref = await _preferenceService.UpsertForOwnerAsync(
            ownerId: ownerId,
            channel: request.Channel,
            preferenceKey: request.PreferenceKey,
            isEnabled: request.IsEnabled,
            cancellationToken: cancellationToken);

        return Ok(ApiResponse<NotificationPreferenceResponse>.CreateSuccess(
            MapToResponse(pref), "Preference updated successfully."));
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

    private static NotificationPreferenceResponse MapToResponse(NotificationPreference p) => new(
        Id: p.Id,
        AdminUserId: p.AdminUserId,
        ClientId: p.ClientId,
        OwnerId: p.OwnerId,
        Channel: p.Channel,
        PreferenceKey: p.PreferenceKey,
        IsEnabled: p.IsEnabled,
        UpdatedAt: p.UpdatedAt
    );
}
