using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Responses.Bookings;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/client/bookings")]
[Authorize(Policy = "ClientOnly")]
public class ClientBookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public ClientBookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BookingListItemResponse>>>> ListOwnBookings(
        [FromQuery] string? bookingStatus = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var clientId = GetCurrentClientId();
        var result = await _bookingService.GetAllAsync(
            bookingStatus: bookingStatus,
            clientId: clientId,
            page: page,
            pageSize: pageSize,
            cancellationToken: cancellationToken);

        var totalPages = (int)Math.Ceiling(result.Total / (double)pageSize);
        if (totalPages == 0) totalPages = 1;

        var response = result.Items.Select(MapToListItemResponse).ToList();
        var pagination = new PaginationMeta(result.Total, page, pageSize, totalPages);

        return Ok(ApiResponse<IReadOnlyList<BookingListItemResponse>>.CreateSuccess(response, null, pagination));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<BookingDetailsResponse>>> GetOwnBooking(Guid id, CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();
        var booking = await _bookingService.GetByIdAsync(id, cancellationToken);

        if (booking == null || booking.ClientId != clientId)
            throw new NotFoundException($"Booking {id} not found.");

        return Ok(ApiResponse<BookingDetailsResponse>.CreateSuccess(MapToDetailsResponse(booking)));
    }

    private Guid GetCurrentClientId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var clientId))
            throw new UnauthorizedBusinessException("Current client ID not found in claims.");

        return clientId;
    }

    private static BookingListItemResponse MapToListItemResponse(Booking booking)
    {
        return new BookingListItemResponse
        {
            Id = booking.Id,
            ClientId = booking.ClientId,
            ClientName = booking.Client?.Name,
            ClientPhone = booking.Client?.Phone,
            UnitId = booking.UnitId,
            UnitName = booking.Unit?.Name,
            OwnerId = booking.OwnerId,
            AssignedAdminUserId = booking.AssignedAdminUserId,
            BookingStatus = booking.BookingStatus.ToString(),
            CheckInDate = booking.CheckInDate,
            CheckOutDate = booking.CheckOutDate,
            GuestCount = booking.GuestCount,
            BaseAmount = booking.BaseAmount,
            FinalAmount = booking.FinalAmount,
            Source = booking.Source,
            CreatedAt = booking.CreatedAt
        };
    }

    private static BookingDetailsResponse MapToDetailsResponse(Booking booking)
    {
        return new BookingDetailsResponse
        {
            Id = booking.Id,
            ClientId = booking.ClientId,
            UnitId = booking.UnitId,
            UnitName = booking.Unit?.Name,
            OwnerId = booking.OwnerId,
            AssignedAdminUserId = booking.AssignedAdminUserId,
            BookingStatus = booking.BookingStatus.ToString(),
            CheckInDate = booking.CheckInDate,
            CheckOutDate = booking.CheckOutDate,
            GuestCount = booking.GuestCount,
            BaseAmount = booking.BaseAmount,
            FinalAmount = booking.FinalAmount,
            Source = booking.Source,
            InternalNotes = booking.InternalNotes,
            CreatedAt = booking.CreatedAt,
            UpdatedAt = booking.UpdatedAt
        };
    }
}