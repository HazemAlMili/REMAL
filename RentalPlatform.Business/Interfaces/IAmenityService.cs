using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IAmenityService
{
    Task<IReadOnlyList<Amenity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Amenity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Amenity> CreateAsync(string name, string? icon, CancellationToken cancellationToken = default);
    Task<Amenity> UpdateAsync(Guid id, string name, string? icon, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
