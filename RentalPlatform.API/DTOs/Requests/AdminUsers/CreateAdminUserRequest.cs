namespace RentalPlatform.API.DTOs.Requests.AdminUsers;

public record CreateAdminUserRequest(
    string Name,
    string Email,
    string Password,
    Guid RoleTemplateId
);
