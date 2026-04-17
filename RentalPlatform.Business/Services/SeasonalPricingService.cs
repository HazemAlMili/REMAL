using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Services;

public class SeasonalPricingService : ISeasonalPricingService
{
    private readonly IUnitOfWork _unitOfWork;

    public SeasonalPricingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SeasonalPricing>> GetByUnitIdAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.SeasonalPricings.Query()
            .Where(sp => sp.UnitId == unitId)
            .OrderBy(sp => sp.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<SeasonalPricing> CreateAsync(Guid unitId, DateOnly startDate, DateOnly endDate, decimal pricePerNight, CancellationToken cancellationToken = default)
    {
        var unitExists = await _unitOfWork.Units.ExistsAsync(u => u.Id == unitId, cancellationToken);
        if (!unitExists)
            throw new NotFoundException($"Unit {unitId} not found");

        if (startDate > endDate)
            throw new BusinessValidationException("Start date cannot be after end date");

        if (pricePerNight < 0)
            throw new BusinessValidationException("Price per night cannot be negative");

        var hasOverlap = await _unitOfWork.SeasonalPricings.Query()
            .Where(sp => sp.UnitId == unitId)
            .AnyAsync(sp => startDate <= sp.EndDate && endDate >= sp.StartDate, cancellationToken);

        if (hasOverlap)
            throw new ConflictException("The specified date range overlaps with an existing seasonal pricing range for this unit.");

        var pricing = new SeasonalPricing
        {
            UnitId = unitId,
            StartDate = startDate,
            EndDate = endDate,
            PricePerNight = pricePerNight
        };

        await _unitOfWork.SeasonalPricings.AddAsync(pricing, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return pricing;
    }

    public async Task<SeasonalPricing> UpdateAsync(Guid id, DateOnly startDate, DateOnly endDate, decimal pricePerNight, CancellationToken cancellationToken = default)
    {
        var pricing = await _unitOfWork.SeasonalPricings.GetByIdAsync(id, cancellationToken);
        if (pricing == null)
            throw new NotFoundException($"Seasonal pricing {id} not found");

        if (startDate > endDate)
            throw new BusinessValidationException("Start date cannot be after end date");

        if (pricePerNight < 0)
            throw new BusinessValidationException("Price per night cannot be negative");

        var hasOverlap = await _unitOfWork.SeasonalPricings.Query()
            .Where(sp => sp.UnitId == pricing.UnitId && sp.Id != id)
            .AnyAsync(sp => startDate <= sp.EndDate && endDate >= sp.StartDate, cancellationToken);

        if (hasOverlap)
            throw new ConflictException("The specified date range overlaps with an existing seasonal pricing range for this unit.");

        pricing.StartDate = startDate;
        pricing.EndDate = endDate;
        pricing.PricePerNight = pricePerNight;

        _unitOfWork.SeasonalPricings.Update(pricing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return pricing;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var pricing = await _unitOfWork.SeasonalPricings.GetByIdAsync(id, cancellationToken);
        if (pricing == null)
            throw new NotFoundException($"Seasonal pricing {id} not found");

        _unitOfWork.SeasonalPricings.Delete(pricing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
