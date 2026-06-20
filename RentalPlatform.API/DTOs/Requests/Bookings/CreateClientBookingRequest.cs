using System;

namespace RentalPlatform.API.DTOs.Requests.Bookings;

// Client-portal booking request. The client is taken from the auth token (never the
// body), so a client can only ever create a booking for themselves.
public record CreateClientBookingRequest
{
    public Guid UnitId { get; init; }
    public DateOnly CheckInDate { get; init; }
    public DateOnly CheckOutDate { get; init; }
    public int GuestCount { get; init; }
}
