using System;

namespace RentalPlatform.API.DTOs.Responses.Areas;

public record AreaResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
