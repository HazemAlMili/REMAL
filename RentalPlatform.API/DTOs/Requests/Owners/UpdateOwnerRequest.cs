namespace RentalPlatform.API.DTOs.Requests.Owners;

public record UpdateOwnerRequest(
    string Name,
    string Phone,
    string? Email,
    decimal CommissionRate,
    string? Notes,
    string Status
);
