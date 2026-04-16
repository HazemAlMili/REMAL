namespace RentalPlatform.API.DTOs.Requests.Auth;

public record ClientLoginRequest(
    string Phone,
    string Password
);
