using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.OwnerPortal;
using RentalPlatform.API.DTOs.Responses.OwnerPortal;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Authorize(Policy = "OwnerOnly")]
public class OwnerPortalFinanceController : ControllerBase
{
    private readonly IOwnerPortalFinanceService _financeService;

    public OwnerPortalFinanceController(IOwnerPortalFinanceService financeService)
    {
        _financeService = financeService;
    }

    // GET /api/owner/finance
    [HttpGet("api/owner/finance")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<OwnerPortalFinanceRowResponse>>>> GetFinanceRows(
        [FromQuery] GetOwnerPortalFinanceRequest request,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var rows = await _financeService.GetAllByOwnerAsync(
            ownerId,
            invoiceStatus: request.InvoiceStatus,
            payoutStatus: request.PayoutStatus,
            cancellationToken: cancellationToken);

        var totalCount = rows.Count;
        var paged = rows
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(MapToRowResponse)
            .ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);
        var pagination = new PaginationMeta(totalCount, request.Page, request.PageSize, totalPages);

        return Ok(ApiResponse<IReadOnlyList<OwnerPortalFinanceRowResponse>>.CreateSuccess(paged, pagination: pagination));
    }

    // GET /api/owner/finance/bookings/{bookingId}
    [HttpGet("api/owner/finance/bookings/{bookingId}")]
    public async Task<ActionResult<ApiResponse<OwnerPortalFinanceRowResponse>>> GetFinanceRowByBooking(
        Guid bookingId,
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var row = await _financeService.GetByOwnerAndBookingIdAsync(ownerId, bookingId, cancellationToken);

        return Ok(ApiResponse<OwnerPortalFinanceRowResponse>.CreateSuccess(MapToRowResponse(row!)));
    }

    // GET /api/owner/finance/summary
    [HttpGet("api/owner/finance/summary")]
    public async Task<ActionResult<ApiResponse<OwnerPortalFinanceSummaryResponse>>> GetFinanceSummary(
        CancellationToken cancellationToken)
    {
        var ownerId = GetCurrentOwnerId();

        var summary = await _financeService.GetSummaryByOwnerAsync(ownerId, cancellationToken);

        return Ok(ApiResponse<OwnerPortalFinanceSummaryResponse>.CreateSuccess(MapToSummaryResponse(summary)));
    }

    private Guid GetCurrentOwnerId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(subClaim) || !Guid.TryParse(subClaim, out var ownerId))
            throw new UnauthorizedAccessException("Current owner ID not found in claims.");

        return ownerId;
    }

    private static OwnerPortalFinanceRowResponse MapToRowResponse(OwnerPortalFinanceOverview row) =>
        new()
        {
            BookingId        = row.BookingId,
            UnitId           = row.UnitId,
            InvoiceId        = row.InvoiceId,
            InvoiceStatus    = row.InvoiceStatus,
            InvoicedAmount   = row.InvoicedAmount,
            PaidAmount       = row.PaidAmount,
            RemainingAmount  = row.RemainingAmount,
            PayoutId         = row.PayoutId,
            PayoutStatus     = row.PayoutStatus,
            PayoutAmount     = row.PayoutAmount,
            PayoutScheduledAt = row.PayoutScheduledAt,
            PayoutPaidAt     = row.PayoutPaidAt,
        };

    private static OwnerPortalFinanceSummaryResponse MapToSummaryResponse(OwnerPortalFinanceSummaryResult summary) =>
        new()
        {
            OwnerId                    = summary.OwnerId,
            TotalInvoicedAmount        = summary.TotalInvoicedAmount,
            TotalPaidAmount            = summary.TotalPaidAmount,
            TotalRemainingAmount       = summary.TotalRemainingAmount,
            TotalPendingPayoutAmount   = summary.TotalPendingPayoutAmount,
            TotalScheduledPayoutAmount = summary.TotalScheduledPayoutAmount,
            TotalPaidPayoutAmount      = summary.TotalPaidPayoutAmount,
        };
}
