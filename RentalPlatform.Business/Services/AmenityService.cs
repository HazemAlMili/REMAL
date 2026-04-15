using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Services;

public class AmenityService : IAmenityService
{
    private readonly IUnitOfWork _unitOfWork;

    public AmenityService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<Amenity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Amenities.ListAsync(cancellationToken);
    }

    public async Task<Amenity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Amenities.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Amenity> CreateAsync(string name, string? icon, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new BusinessValidationException("Amenity name cannot be empty.");
        }

        var exists = await _unitOfWork.Amenities.ExistsAsync(a => a.Name.ToLower() == trimmedName.ToLower(), cancellationToken);
        if (exists)
        {
            throw new ConflictException($"Amenity with name '{trimmedName}' already exists.");
        }

        var amenity = new Amenity
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            Icon = icon
        };

        await _unitOfWork.Amenities.AddAsync(amenity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return amenity;
    }

    public async Task<Amenity> UpdateAsync(Guid id, string name, string? icon, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new BusinessValidationException("Amenity name cannot be empty.");
        }

        var amenity = await _unitOfWork.Amenities.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Amenity with ID {id} not found.");

        var exists = await _unitOfWork.Amenities.ExistsAsync(a => a.Name.ToLower() == trimmedName.ToLower() && a.Id != id, cancellationToken);
        if (exists)
        {
            throw new ConflictException($"Amenity with name '{trimmedName}' already exists.");
        }

        amenity.Name = trimmedName;
        amenity.Icon = icon;

        _unitOfWork.Amenities.Update(amenity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return amenity;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var amenity = await _unitOfWork.Amenities.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Amenity with ID {id} not found.");

        _unitOfWork.Amenities.Delete(amenity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
