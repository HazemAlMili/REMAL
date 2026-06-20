using System;

namespace RentalPlatform.API.DTOs.Responses.Clients;

public record ClientListItemResponse(
    Guid Id,
    string Name,
    string Phone,
    string? Email,
    bool IsActive,
    DateTime CreatedAt
);

public record ClientDetailsResponse(
    Guid Id,
    string Name,
    string Phone,
    string? Email,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateClientResponse(
    Guid Id,
    string Name,
    string Phone,
    string? Email,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string TemporaryPassword
);

public record ClientProfileResponse(
    Guid Id,
    string Name,
    string Phone,
    string? Email,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
