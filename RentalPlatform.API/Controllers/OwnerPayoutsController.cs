using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.OwnerPayouts;
using RentalPlatform.API.DTOs.Responses.OwnerPayouts;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
public class OwnerPayoutsController : ControllerBase
{
    private readonly IOwnerPayoutService _ownerPayoutService;

    public OwnerPayoutsController(IOwnerPayoutService ownerPayoutService)
    {
        _ownerPayoutService = ownerPayoutService;
    }

    // GET /api/internal/owner-payouts/by-booking/{bookingId}
    [HttpGet("api/internal/owner-payouts/by-booking/{bookingId}")]
    [Authorize(Policy = "FinanceOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<OwnerPayoutResponse>>> GetPayoutByBooking(Guid bookingId)
    {
        var payout = await _ownerPayoutService.GetByBookingIdAsync(bookingId);

        if (payout == null)
            return NotFound(ApiResponse.CreateFailure("Owner payout for this booking not found."));

        return Ok(ApiResponse<OwnerPayoutResponse>.CreateSuccess(MapToResponse(payout)));
    }

    // GET /api/internal/owners/{ownerId}/payouts
    [HttpGet("api/internal/owners/{ownerId}/payouts")]
    [Authorize(Policy = "FinanceOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<OwnerPayoutResponse>>>> GetPayoutsByOwner(
        Guid ownerId,
        [FromQuery] string? payoutStatus = null)
    {
        var payouts = await _ownerPayoutService.GetByOwnerIdAsync(ownerId, payoutStatus);
        var response = payouts.Select(MapToResponse).ToList();

        return Ok(ApiResponse<IReadOnlyList<OwnerPayoutResponse>>.CreateSuccess(response));
    }

    // POST /api/internal/owner-payouts
    [HttpPost("api/internal/owner-payouts")]
    [Authorize(Policy = "FinanceOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<OwnerPayoutResponse>>> CreateOrUpdateOwnerPayout(CreateOrUpdateOwnerPayoutRequest request)
    {
        var payout = await _ownerPayoutService.CreateOrUpdateFromBookingAsync(
            request.BookingId,
            request.CommissionRate,
            request.Notes
        );

        return Ok(ApiResponse<OwnerPayoutResponse>.CreateSuccess(MapToResponse(payout), "Owner payout snapshot saved successfully."));
    }

    // POST /api/internal/owner-payouts/{id}/schedule
    [HttpPost("api/internal/owner-payouts/{id}/schedule")]
    [Authorize(Policy = "FinanceOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<OwnerPayoutResponse>>> SetPayoutScheduled(Guid id, SetOwnerPayoutScheduledRequest request)
    {
        var payout = await _ownerPayoutService.SetScheduledAsync(id, request.Notes);

        return Ok(ApiResponse<OwnerPayoutResponse>.CreateSuccess(MapToResponse(payout), "Owner payout scheduled."));
    }

    // POST /api/internal/owner-payouts/{id}/mark-paid
    [HttpPost("api/internal/owner-payouts/{id}/mark-paid")]
    [Authorize(Policy = "FinanceOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<OwnerPayoutResponse>>> MarkPayoutPaid(Guid id, MarkOwnerPayoutPaidRequest request)
    {
        var payout = await _ownerPayoutService.MarkPaidAsync(id, request.Notes);

        return Ok(ApiResponse<OwnerPayoutResponse>.CreateSuccess(MapToResponse(payout), "Owner payout marked as paid."));
    }

    // POST /api/internal/owner-payouts/{id}/cancel
    [HttpPost("api/internal/owner-payouts/{id}/cancel")]
    [Authorize(Policy = "FinanceOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<OwnerPayoutResponse>>> CancelPayout(Guid id, CancelOwnerPayoutRequest request)
    {
        var payout = await _ownerPayoutService.CancelAsync(id, request.Notes);

        return Ok(ApiResponse<OwnerPayoutResponse>.CreateSuccess(MapToResponse(payout), "Owner payout cancelled."));
    }

    private static OwnerPayoutResponse MapToResponse(OwnerPayout payout)
    {
        return new OwnerPayoutResponse
        {
            Id = payout.Id,
            BookingId = payout.BookingId,
            OwnerId = payout.OwnerId,
            PayoutStatus = payout.PayoutStatus,
            GrossBookingAmount = payout.GrossBookingAmount,
            CommissionRate = payout.CommissionRate,
            CommissionAmount = payout.CommissionAmount,
            PayoutAmount = payout.PayoutAmount,
            ScheduledAt = payout.ScheduledAt,
            PaidAt = payout.PaidAt,
            Notes = payout.Notes,
            CreatedAt = payout.CreatedAt,
            UpdatedAt = payout.UpdatedAt
        };
    }
}
