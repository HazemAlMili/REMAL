using System;

namespace RentalPlatform.API.DTOs.Requests.Bookings;

public record UpdatePendingBookingRequest
{
    public DateOnly CheckInDate { get; init; }
    public DateOnly CheckOutDate { get; init; }
    public int GuestCount { get; init; }
    public string Source { get; init; } = string.Empty;
    public Guid? AssignedAdminUserId { get; init; }
    public string? InternalNotes { get; init; }
}
