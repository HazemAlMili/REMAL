using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Responses.Finance;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using System;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
public class FinanceSummaryController : ControllerBase
{
    private readonly IFinanceSummaryService _financeSummaryService;

    public FinanceSummaryController(IFinanceSummaryService financeSummaryService)
    {
        _financeSummaryService = financeSummaryService;
    }

    // GET /api/internal/invoices/{invoiceId}/balance
    [HttpGet("api/internal/invoices/{invoiceId}/balance")]
    [Authorize(Policy = "FinanceOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<InvoiceBalanceResponse>>> GetInvoiceBalance(Guid invoiceId)
    {
        var summary = await _financeSummaryService.GetInvoiceBalanceAsync(invoiceId);

        return Ok(ApiResponse<InvoiceBalanceResponse>.CreateSuccess(new InvoiceBalanceResponse
        {
            InvoiceId = summary.InvoiceId,
            TotalAmount = summary.TotalAmount,
            PaidAmount = summary.PaidAmount,
            RemainingAmount = summary.RemainingAmount,
            IsFullyPaid = summary.IsFullyPaid
        }));
    }

    // GET /api/internal/bookings/{bookingId}/finance-snapshot
    [HttpGet("api/internal/bookings/{bookingId}/finance-snapshot")]
    [Authorize(Policy = "InternalAdminRead")]
    public async Task<ActionResult<ApiResponse<BookingFinanceSnapshotResponse>>> GetBookingFinanceSnapshot(Guid bookingId)
    {
        var summary = await _financeSummaryService.GetBookingFinanceSnapshotAsync(bookingId);

        return Ok(ApiResponse<BookingFinanceSnapshotResponse>.CreateSuccess(new BookingFinanceSnapshotResponse
        {
            BookingId = summary.BookingId,
            InvoiceId = summary.InvoiceId,
            InvoiceStatus = summary.InvoiceStatus,
            InvoicedAmount = summary.InvoicedAmount,
            PaidAmount = summary.PaidAmount,
            RemainingAmount = summary.RemainingAmount,
            OwnerPayoutStatus = summary.OwnerPayoutStatus
        }));
    }

    // GET /api/internal/owners/{ownerId}/payout-summary
    [HttpGet("api/internal/owners/{ownerId}/payout-summary")]
    [Authorize(Policy = "FinanceOrSuperAdmin")]
    public async Task<ActionResult<ApiResponse<OwnerPayoutSummaryResponse>>> GetOwnerPayoutSummary(Guid ownerId)
    {
        var summary = await _financeSummaryService.GetOwnerPayoutSummaryAsync(ownerId);

        return Ok(ApiResponse<OwnerPayoutSummaryResponse>.CreateSuccess(new OwnerPayoutSummaryResponse
        {
            OwnerId = summary.OwnerId,
            TotalPending = summary.TotalPending,
            TotalScheduled = summary.TotalScheduled,
            TotalPaid = summary.TotalPaid
        }));
    }
}
