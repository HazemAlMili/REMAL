namespace RentalPlatform.API.DTOs.Requests.Auth;

public record OwnerLoginRequest(
    string Phone,
    string Password
);
