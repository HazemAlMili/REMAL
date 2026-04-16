namespace RentalPlatform.API.DTOs.Requests.Auth;

public record ClientRegisterRequest(
    string Name,
    string Phone,
    string? Email,
    string Password
);
