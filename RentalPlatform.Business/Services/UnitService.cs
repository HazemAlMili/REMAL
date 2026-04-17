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

public class UnitService : IUnitService
{
    private readonly IUnitOfWork _unitOfWork;
    private static readonly string[] AllowedUnitTypes = { "apartment", "villa", "chalet", "studio" };

    public UnitService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<Unit>> GetAllAsync(bool includeInactive = true, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Units.Query();
        
        if (!includeInactive)
        {
            query = query.Where(u => u.IsActive);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Unit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Units.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Unit> CreateAsync(
        Guid ownerId, 
        Guid areaId, 
        string name, 
        string? description, 
        string? address, 
        string unitType, 
        int bedrooms, 
        int bathrooms, 
        int maxGuests, 
        decimal basePricePerNight, 
        bool isActive = true, 
        CancellationToken cancellationToken = default)
    {
        ValidateUnitData(name, unitType, bedrooms, bathrooms, maxGuests, basePricePerNight);

        var ownerExists = await _unitOfWork.Owners.ExistsAsync(o => o.Id == ownerId, cancellationToken);
        if (!ownerExists)
            throw new NotFoundException($"Owner with ID {ownerId} not found");

        var areaExists = await _unitOfWork.Areas.ExistsAsync(a => a.Id == areaId, cancellationToken);
        if (!areaExists)
            throw new NotFoundException($"Area with ID {areaId} not found");

        var unit = new Unit
        {
            OwnerId = ownerId,
            AreaId = areaId,
            Name = name.Trim(),
            Description = description?.Trim(),
            Address = address?.Trim(),
            UnitType = unitType.Trim().ToLower(),
            Bedrooms = bedrooms,
            Bathrooms = bathrooms,
            MaxGuests = maxGuests,
            BasePricePerNight = basePricePerNight,
            IsActive = isActive
        };

        await _unitOfWork.Units.AddAsync(unit, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return unit;
    }

    public async Task<Unit> UpdateAsync(
        Guid id, 
        Guid ownerId, 
        Guid areaId, 
        string name, 
        string? description, 
        string? address, 
        string unitType, 
        int bedrooms, 
        int bathrooms, 
        int maxGuests, 
        decimal basePricePerNight, 
        bool isActive, 
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitOfWork.Units.GetByIdAsync(id, cancellationToken);
        if (unit == null)
            throw new NotFoundException($"Unit with ID {id} not found");

        ValidateUnitData(name, unitType, bedrooms, bathrooms, maxGuests, basePricePerNight);

        if (unit.OwnerId != ownerId)
        {
            var ownerExists = await _unitOfWork.Owners.ExistsAsync(o => o.Id == ownerId, cancellationToken);
            if (!ownerExists)
                throw new NotFoundException($"Owner with ID {ownerId} not found");
        }

        if (unit.AreaId != areaId)
        {
            var areaExists = await _unitOfWork.Areas.ExistsAsync(a => a.Id == areaId, cancellationToken);
            if (!areaExists)
                throw new NotFoundException($"Area with ID {areaId} not found");
        }

        unit.OwnerId = ownerId;
        unit.AreaId = areaId;
        unit.Name = name.Trim();
        unit.Description = description?.Trim();
        unit.Address = address?.Trim();
        unit.UnitType = unitType.Trim().ToLower();
        unit.Bedrooms = bedrooms;
        unit.Bathrooms = bathrooms;
        unit.MaxGuests = maxGuests;
        unit.BasePricePerNight = basePricePerNight;
        unit.IsActive = isActive;

        _unitOfWork.Units.Update(unit);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return unit;
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var unit = await _unitOfWork.Units.GetByIdAsync(id, cancellationToken);
        if (unit == null)
            throw new NotFoundException($"Unit with ID {id} not found");

        _unitOfWork.Units.Delete(unit);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
    {
        var unit = await _unitOfWork.Units.GetByIdAsync(id, cancellationToken);
        if (unit == null)
            throw new NotFoundException($"Unit with ID {id} not found");

        unit.IsActive = isActive;
        _unitOfWork.Units.Update(unit);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private void ValidateUnitData(string name, string unitType, int bedrooms, int bathrooms, int maxGuests, decimal basePricePerNight)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new BusinessValidationException("Unit name is required");

        if (string.IsNullOrWhiteSpace(unitType))
            throw new BusinessValidationException("Unit type is required");

        var normalizedType = unitType.Trim().ToLower();
        if (!AllowedUnitTypes.Contains(normalizedType))
            throw new BusinessValidationException($"Invalid unit type '{unitType}'. Allowed values: {string.Join(", ", AllowedUnitTypes)}");

        if (bedrooms < 0)
            throw new BusinessValidationException("Bedrooms cannot be negative");

        if (bathrooms < 0)
            throw new BusinessValidationException("Bathrooms cannot be negative");

        if (maxGuests <= 0)
            throw new BusinessValidationException("MaxGuests must be greater than zero");

        if (basePricePerNight < 0)
            throw new BusinessValidationException("BasePricePerNight cannot be negative");
    }
}
