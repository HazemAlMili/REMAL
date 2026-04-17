using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface IUnitImageService
{
    Task<IReadOnlyList<UnitImage>> GetByUnitIdAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<UnitImage> AddAsync(Guid unitId, string fileKey, bool isCover, int displayOrder, CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid unitId, Guid imageId, CancellationToken cancellationToken = default);
    Task ReorderAsync(Guid unitId, IReadOnlyList<(Guid ImageId, int DisplayOrder)> ordering, CancellationToken cancellationToken = default);
    Task SetCoverAsync(Guid unitId, Guid imageId, CancellationToken cancellationToken = default);
}
