using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IUnitService
{
    Task<IReadOnlyList<Unit>> GetAllAsync(bool includeInactive = true, CancellationToken cancellationToken = default);
    Task<Unit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Unit> CreateAsync(Guid ownerId, Guid areaId, string name, string? description, string? address, string unitType, int bedrooms, int bathrooms, int maxGuests, decimal basePricePerNight, bool isActive = true, CancellationToken cancellationToken = default);
    Task<Unit> UpdateAsync(Guid id, Guid ownerId, Guid areaId, string name, string? description, string? address, string unitType, int bedrooms, int bathrooms, int maxGuests, decimal basePricePerNight, bool isActive, CancellationToken cancellationToken = default);
    Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);
}
