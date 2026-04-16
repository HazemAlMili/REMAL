using System;

namespace RentalPlatform.API.DTOs.Responses.Owners;

public record OwnerListItemResponse(
    Guid Id,
    string Name,
    string Phone,
    string? Email,
    decimal CommissionRate,
    string Status,
    DateTime CreatedAt
);

public record OwnerDetailsResponse(
    Guid Id,
    string Name,
    string Phone,
    string? Email,
    decimal CommissionRate,
    string? Notes,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
