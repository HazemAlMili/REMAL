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

public class UnitAmenityService : IUnitAmenityService
{
    private readonly IUnitOfWork _unitOfWork;

    public UnitAmenityService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<Amenity>> GetAmenitiesAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        var unitExists = await _unitOfWork.Units.ExistsAsync(u => u.Id == unitId, cancellationToken);
        if (!unitExists)
            throw new NotFoundException($"Unit {unitId} not found");

        var unitAmenities = await _unitOfWork.UnitAmenities.Query()
            .Include(ua => ua.Amenity)
            .Where(ua => ua.UnitId == unitId)
            .ToListAsync(cancellationToken);

        return unitAmenities.Select(ua => ua.Amenity).ToList();
    }

    public async Task AssignAsync(Guid unitId, Guid amenityId, CancellationToken cancellationToken = default)
    {
        var unitExists = await _unitOfWork.Units.ExistsAsync(u => u.Id == unitId, cancellationToken);
        if (!unitExists)
            throw new NotFoundException($"Unit {unitId} not found");

        var amenityExists = await _unitOfWork.Amenities.ExistsAsync(a => a.Id == amenityId, cancellationToken);
        if (!amenityExists)
            throw new NotFoundException($"Amenity {amenityId} not found");

        var linkExists = await _unitOfWork.UnitAmenities.ExistsAsync(ua => ua.UnitId == unitId && ua.AmenityId == amenityId, cancellationToken);
        if (linkExists)
            return; // Idempotent success (no-op)

        var link = new UnitAmenity
        {
            UnitId = unitId,
            AmenityId = amenityId
        };
        await _unitOfWork.UnitAmenities.AddAsync(link, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveAsync(Guid unitId, Guid amenityId, CancellationToken cancellationToken = default)
    {
        var link = await _unitOfWork.UnitAmenities.FirstOrDefaultAsync(ua => ua.UnitId == unitId && ua.AmenityId == amenityId, cancellationToken);
        if (link == null)
            return; // Idempotent success (no-op)

        _unitOfWork.UnitAmenities.Delete(link);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ReplaceAllAsync(Guid unitId, IReadOnlyList<Guid> amenityIds, CancellationToken cancellationToken = default)
    {
        var unitExists = await _unitOfWork.Units.ExistsAsync(u => u.Id == unitId, cancellationToken);
        if (!unitExists)
            throw new NotFoundException($"Unit {unitId} not found");

        var distinctAmenityIds = amenityIds.Distinct().ToList();

        if (distinctAmenityIds.Any())
        {
            var existingAmenitiesCount = await _unitOfWork.Amenities.Query()
                .Where(a => distinctAmenityIds.Contains(a.Id))
                .CountAsync(cancellationToken);

            if (existingAmenitiesCount != distinctAmenityIds.Count)
            {
                throw new NotFoundException("One or more amenities were not found.");
            }
        }

        var existingLinks = await _unitOfWork.UnitAmenities.Query()
            .Where(ua => ua.UnitId == unitId)
            .ToListAsync(cancellationToken);

        var existingAmenityIds = existingLinks.Select(ua => ua.AmenityId).ToHashSet();

        var toAdd = distinctAmenityIds.Where(id => !existingAmenityIds.Contains(id)).ToList();
        var toRemove = existingLinks.Where(link => !distinctAmenityIds.Contains(link.AmenityId)).ToList();

        foreach (var link in toRemove)
        {
            _unitOfWork.UnitAmenities.Delete(link);
        }

        foreach (var id in toAdd)
        {
            var newLink = new UnitAmenity
            {
                UnitId = unitId,
                AmenityId = id
            };
            await _unitOfWork.UnitAmenities.AddAsync(newLink, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
