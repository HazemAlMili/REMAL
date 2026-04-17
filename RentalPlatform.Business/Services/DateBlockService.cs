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

public class DateBlockService : IDateBlockService
{
    private readonly IUnitOfWork _unitOfWork;

    public DateBlockService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<DateBlock>> GetByUnitIdAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.DateBlocks.Query()
            .Where(db => db.UnitId == unitId)
            .OrderBy(db => db.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<DateBlock> CreateAsync(
        Guid unitId, 
        DateOnly startDate, 
        DateOnly endDate, 
        string? reason, 
        string? notes, 
        CancellationToken cancellationToken = default)
    {
        var unitExists = await _unitOfWork.Units.ExistsAsync(u => u.Id == unitId, cancellationToken);
        if (!unitExists)
            throw new NotFoundException($"Unit {unitId} not found");

        if (startDate > endDate)
            throw new BusinessValidationException("Start date cannot be after end date");

        var hasOverlap = await _unitOfWork.DateBlocks.Query()
            .Where(db => db.UnitId == unitId)
            .AnyAsync(db => startDate <= db.EndDate && endDate >= db.StartDate, cancellationToken);

        if (hasOverlap)
            throw new ConflictException("The specified date range overlaps with an existing date block for this unit.");

        var block = new DateBlock
        {
            UnitId = unitId,
            StartDate = startDate,
            EndDate = endDate,
            Reason = reason?.Trim(),
            Notes = notes?.Trim()
        };

        await _unitOfWork.DateBlocks.AddAsync(block, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return block;
    }

    public async Task<DateBlock> UpdateAsync(
        Guid id, 
        DateOnly startDate, 
        DateOnly endDate, 
        string? reason, 
        string? notes, 
        CancellationToken cancellationToken = default)
    {
        var block = await _unitOfWork.DateBlocks.GetByIdAsync(id, cancellationToken);
        if (block == null)
            throw new NotFoundException($"Date block {id} not found");

        if (startDate > endDate)
            throw new BusinessValidationException("Start date cannot be after end date");

        var hasOverlap = await _unitOfWork.DateBlocks.Query()
            .Where(db => db.UnitId == block.UnitId && db.Id != id)
            .AnyAsync(db => startDate <= db.EndDate && endDate >= db.StartDate, cancellationToken);

        if (hasOverlap)
            throw new ConflictException("The specified date range overlaps with an existing date block for this unit.");

        block.StartDate = startDate;
        block.EndDate = endDate;
        block.Reason = reason?.Trim();
        block.Notes = notes?.Trim();

        _unitOfWork.DateBlocks.Update(block);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return block;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var block = await _unitOfWork.DateBlocks.GetByIdAsync(id, cancellationToken);
        if (block == null)
            throw new NotFoundException($"Date block {id} not found");

        _unitOfWork.DateBlocks.Delete(block);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
