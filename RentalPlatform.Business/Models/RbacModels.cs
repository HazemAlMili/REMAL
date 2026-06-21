namespace RentalPlatform.Business.Models;

public sealed record RbacRoleTemplateModel(
    Guid Id,
    string Name,
    string? Description,
    bool IsSystem,
    bool IsActive,
    IReadOnlyCollection<string> Permissions,
    int AssignedUserCount,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record RbacUserOverridesModel(
    Guid AdminUserId,
    IReadOnlyCollection<string> Effective,
    IReadOnlyCollection<string> Inherited,
    IReadOnlyCollection<string> Grants,
    IReadOnlyCollection<string> Denies);
