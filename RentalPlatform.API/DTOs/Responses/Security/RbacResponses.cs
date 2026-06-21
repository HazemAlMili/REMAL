using RentalPlatform.API.Authorization;
using RentalPlatform.Business.Models;

namespace RentalPlatform.API.DTOs.Responses.Security;

public record PermissionGroupResponse(
    string Module,
    IReadOnlyCollection<PermissionDescriptor> Permissions);

public record RoleTemplateResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsSystem,
    bool IsActive,
    IReadOnlyCollection<string> Permissions,
    int AssignedUserCount,
    DateTime CreatedAt,
    DateTime UpdatedAt)
{
    public static RoleTemplateResponse FromModel(RbacRoleTemplateModel model) =>
        new(
            model.Id,
            model.Name,
            model.Description,
            model.IsSystem,
            model.IsActive,
            model.Permissions,
            model.AssignedUserCount,
            model.CreatedAt,
            model.UpdatedAt);
}

public record UserPermissionOverridesResponse(
    Guid AdminUserId,
    IReadOnlyCollection<string> Effective,
    IReadOnlyCollection<string> Inherited,
    IReadOnlyCollection<string> Grants,
    IReadOnlyCollection<string> Denies)
{
    public static UserPermissionOverridesResponse FromModel(RbacUserOverridesModel model) =>
        new(
            model.AdminUserId,
            model.Effective,
            model.Inherited,
            model.Grants,
            model.Denies);
}
