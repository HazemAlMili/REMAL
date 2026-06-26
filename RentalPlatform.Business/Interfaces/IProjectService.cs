using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IProjectService
{
    Task<IReadOnlyList<Project>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Project> CreateAsync(string name, string? description, bool isActive = true, CancellationToken cancellationToken = default);
    Task<Project> UpdateAsync(Guid id, string name, string? description, bool isActive, CancellationToken cancellationToken = default);
    Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);
}
