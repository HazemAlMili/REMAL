namespace RentalPlatform.API.DTOs.Responses.AdminUsers;

public record AdminDirectoryResponse(
    Guid Id,
    string Name,
    string Email,
    string RoleName,
    bool IsActive);
