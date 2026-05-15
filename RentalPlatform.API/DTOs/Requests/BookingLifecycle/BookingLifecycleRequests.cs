using System;

namespace RentalPlatform.API.DTOs.Requests.BookingLifecycle;

public record ConfirmBookingRequest
{
    public string? Notes { get; init; }
}

public record BookedBookingRequest
{
    public string? Notes { get; init; }
}

public record RelevantBookingRequest
{
    public string? Notes { get; init; }
}

public record NoAnswerBookingRequest
{
    public string? Notes { get; init; }
}

public record NotRelevantBookingRequest
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

public record CheckInBookingRequest
{
    public string? Notes { get; init; }
}

public record LeftEarlyBookingRequest
{
    public string? Notes { get; init; }
}
