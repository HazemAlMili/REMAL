using RentalPlatform.Business.Models;

namespace RentalPlatform.Business.Interfaces;

public interface IRbacAdminService
{
    Task<IReadOnlyList<RbacRoleTemplateModel>> GetRoleTemplatesAsync(
        CancellationToken cancellationToken = default);
    Task<RbacRoleTemplateModel> CreateRoleTemplateAsync(
        string name,
        string? description,
        IReadOnlyCollection<string> permissionKeys,
        CancellationToken cancellationToken = default);
    Task<RbacRoleTemplateModel> UpdateRoleTemplateAsync(
        Guid callerId,
        Guid roleTemplateId,
        string name,
        string? description,
        IReadOnlyCollection<string> permissionKeys,
        CancellationToken cancellationToken = default);
    Task DeleteRoleTemplateAsync(
        Guid roleTemplateId,
        CancellationToken cancellationToken = default);
    Task<RbacUserOverridesModel> GetUserOverridesAsync(
        Guid adminUserId,
        CancellationToken cancellationToken = default);
    Task<RbacUserOverridesModel> ReplaceUserOverridesAsync(
        Guid callerId,
        Guid adminUserId,
        IReadOnlyCollection<string> grants,
        IReadOnlyCollection<string> denies,
        CancellationToken cancellationToken = default);
}
