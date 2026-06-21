namespace RentalPlatform.API.DTOs.Requests.Security;

public record CreateRoleTemplateRequest(
    string Name,
    string? Description,
    IReadOnlyCollection<string> PermissionKeys);

public record UpdateRoleTemplateRequest(
    string Name,
    string? Description,
    IReadOnlyCollection<string> PermissionKeys);

public record UpdateUserPermissionOverridesRequest(
    IReadOnlyCollection<string> Grants,
    IReadOnlyCollection<string> Denies);
