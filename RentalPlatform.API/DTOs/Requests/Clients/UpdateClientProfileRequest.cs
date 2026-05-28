namespace RentalPlatform.API.DTOs.Requests.Clients;

public record UpdateClientProfileRequest(
    string Name,
    string Phone,
    string? Email
);