using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Responses.OwnerPortal;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Authorize(Policy = "OwnerOnly")]
public class OwnerPortalDashboardController : ControllerBase
{
    private readonly IOwnerPortalDashboardService _dashboardService;

    public OwnerPortalDashboardController(IOwnerPortalDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    // GET /api/owner/dashboard
    [HttpGet("api/owner/dashboard")]
    public async Task<ActionResult<ApiResponse<OwnerPortalDashboardSummaryResponse>>> GetDashboard(
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var summary = await _dashboardService.GetSummaryAsync(ownerId, cancellationToken);

        return Ok(ApiResponse<OwnerPortalDashboardSummaryResponse>.CreateSuccess(MapToResponse(summary)));
    }

    private Guid GetCurrentOwnerId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(subClaim) || !Guid.TryParse(subClaim, out var ownerId))
            throw new UnauthorizedAccessException("Current owner ID not found in claims.");

        return ownerId;
    }

    private static OwnerPortalDashboardSummaryResponse MapToResponse(OwnerPortalDashboardSummaryResult summary) =>
        new()
        {
            OwnerId                  = summary.OwnerId,
            TotalUnits               = summary.TotalUnits,
            ActiveUnits              = summary.ActiveUnits,
            TotalBookings            = summary.TotalBookings,
            ConfirmedBookings        = summary.ConfirmedBookings,
            CompletedBookings        = summary.CompletedBookings,
            TotalPaidAmount          = summary.TotalPaidAmount,
            TotalPendingPayoutAmount = summary.TotalPendingPayoutAmount,
            TotalPaidPayoutAmount    = summary.TotalPaidPayoutAmount,
        };
}
