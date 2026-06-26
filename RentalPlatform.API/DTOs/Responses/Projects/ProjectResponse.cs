using System;

namespace RentalPlatform.API.DTOs.Responses.Projects;

public record ProjectResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
