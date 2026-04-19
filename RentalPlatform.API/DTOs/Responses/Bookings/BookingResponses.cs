using System;

namespace RentalPlatform.API.DTOs.Responses.Bookings;

public record BookingListItemResponse
{
    public Guid Id { get; init; }
    public Guid ClientId { get; init; }
    public Guid UnitId { get; init; }
    public Guid OwnerId { get; init; }
    public Guid? AssignedAdminUserId { get; init; }
    public string BookingStatus { get; init; } = string.Empty;
    public DateOnly CheckInDate { get; init; }
    public DateOnly CheckOutDate { get; init; }
    public int GuestCount { get; init; }
    public decimal BaseAmount { get; init; }
    public decimal FinalAmount { get; init; }
    public string Source { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public record BookingDetailsResponse
{
    public Guid Id { get; init; }
    public Guid ClientId { get; init; }
    public Guid UnitId { get; init; }
    public Guid OwnerId { get; init; }
    public Guid? AssignedAdminUserId { get; init; }
    public string BookingStatus { get; init; } = string.Empty;
    public DateOnly CheckInDate { get; init; }
    public DateOnly CheckOutDate { get; init; }
    public int GuestCount { get; init; }
    public decimal BaseAmount { get; init; }
    public decimal FinalAmount { get; init; }
    public string Source { get; init; } = string.Empty;
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
