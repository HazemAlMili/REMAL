namespace RentalPlatform.API.DTOs.Responses.Auth;

public record AuthenticatedUserResponse(
    Guid UserId,
    string Identifier,
    string SubjectType,
    string? AdminRole,
    string? Name
);

public record AuthResponse(
    string AccessToken,
    int ExpiresInSeconds,
    string SubjectType,
    string? AdminRole,
    AuthenticatedUserResponse User,
    IReadOnlyList<string> Permissions
);
