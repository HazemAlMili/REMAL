using System;

namespace RentalPlatform.API.DTOs.Requests.BookingLifecycle;

public record ConfirmBookingRequest
{
    public string? Notes { get; init; }
}

public record CancelBookingRequest
{
    public string? Notes { get; init; }
}

public record CompleteBookingRequest
{
    public string? Notes { get; init; }
}
