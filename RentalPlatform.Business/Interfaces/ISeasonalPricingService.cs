using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface ISeasonalPricingService
{
    Task<IReadOnlyList<SeasonalPricing>> GetByUnitIdAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<SeasonalPricing> CreateAsync(Guid unitId, DateOnly startDate, DateOnly endDate, decimal pricePerNight, CancellationToken cancellationToken = default);
    Task<SeasonalPricing> UpdateAsync(Guid id, DateOnly startDate, DateOnly endDate, decimal pricePerNight, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
