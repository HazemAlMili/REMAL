using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IUnitAmenityService
{
    Task<IReadOnlyList<Amenity>> GetAmenitiesAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task AssignAsync(Guid unitId, Guid amenityId, CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid unitId, Guid amenityId, CancellationToken cancellationToken = default);
    Task ReplaceAllAsync(Guid unitId, IReadOnlyList<Guid> amenityIds, CancellationToken cancellationToken = default);
}
