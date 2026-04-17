namespace RentalPlatform.API.DTOs.Requests.Units;

public record UpdateUnitStatusRequest
{
    public bool IsActive { get; init; }
}
