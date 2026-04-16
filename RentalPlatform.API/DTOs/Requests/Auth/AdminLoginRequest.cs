namespace RentalPlatform.API.DTOs.Requests.Auth;

public record AdminLoginRequest(
    string Email,
    string Password
);
