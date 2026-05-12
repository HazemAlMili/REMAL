namespace RentalPlatform.API.DTOs.Requests.Clients;

public record CreateClientRequest(
    string Name,
    string Phone,
    string? Email
);
