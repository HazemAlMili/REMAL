using RentalPlatform.Shared.Enums;

namespace RentalPlatform.API.DTOs.Requests.AdminUsers;

public record UpdateAdminUserRoleRequest(
    AdminRole Role
);
