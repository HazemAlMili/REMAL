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

public class AreaService : IAreaService
{
    private readonly IUnitOfWork _unitOfWork;

    public AreaService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<Area>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Areas.Query();

        if (!includeInactive)
        {
            query = query.Where(a => a.IsActive);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Area?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Areas.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Area> CreateAsync(string name, string? description, bool isActive = true, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new BusinessValidationException("Area name cannot be empty.");
        }

        var exists = await _unitOfWork.Areas.ExistsAsync(a => a.Name.ToLower() == trimmedName.ToLower(), cancellationToken);
        if (exists)
        {
            throw new ConflictException($"Area with name '{trimmedName}' already exists.");
        }

        var area = new Area
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            Description = description,
            IsActive = isActive
        };

        await _unitOfWork.Areas.AddAsync(area, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return area;
    }

    public async Task<Area> UpdateAsync(Guid id, string name, string? description, bool isActive, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new BusinessValidationException("Area name cannot be empty.");
        }

        var area = await _unitOfWork.Areas.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Area with ID {id} not found.");

        var exists = await _unitOfWork.Areas.ExistsAsync(a => a.Name.ToLower() == trimmedName.ToLower() && a.Id != id, cancellationToken);
        if (exists)
        {
            throw new ConflictException($"Area with name '{trimmedName}' already exists.");
        }

        area.Name = trimmedName;
        area.Description = description;
        area.IsActive = isActive;

        _unitOfWork.Areas.Update(area);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return area;
    }

    public async Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
    {
        var area = await _unitOfWork.Areas.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Area with ID {id} not found.");

        area.IsActive = isActive;

        _unitOfWork.Areas.Update(area);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
