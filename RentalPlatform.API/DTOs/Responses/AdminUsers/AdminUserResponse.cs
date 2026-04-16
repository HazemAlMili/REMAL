using RentalPlatform.Shared.Enums;
using System;

namespace RentalPlatform.API.DTOs.Responses.AdminUsers;

public record AdminUserResponse(
    Guid Id,
    string Name,
    string Email,
    AdminRole Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
