using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IAdminUserService
{
    Task<IReadOnlyList<AdminUser>> GetAllAsync(bool includeInactive = true, CancellationToken cancellationToken = default);
    Task<AdminUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<AdminUser> CreateAsync(string name, string email, string plainTextPassword, Guid roleTemplateId, CancellationToken cancellationToken = default);
    Task<AdminUser> UpdateRoleAsync(Guid id, Guid roleTemplateId, CancellationToken cancellationToken = default);
    Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);
}
