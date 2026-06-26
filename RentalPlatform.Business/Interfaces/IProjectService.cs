using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IAreaService
{
    Task<IReadOnlyList<Area>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    Task<Area?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Area> CreateAsync(string name, string? description, bool isActive = true, CancellationToken cancellationToken = default);
    Task<Area> UpdateAsync(Guid id, string name, string? description, bool isActive, CancellationToken cancellationToken = default);
    Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);
}
