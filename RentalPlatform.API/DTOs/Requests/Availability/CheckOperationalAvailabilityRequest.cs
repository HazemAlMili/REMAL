using System;

namespace RentalPlatform.API.DTOs.Requests.Availability;

public record CheckOperationalAvailabilityRequest
{
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
}
