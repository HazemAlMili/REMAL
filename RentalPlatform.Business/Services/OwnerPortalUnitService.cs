using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Business.Services;

public class OwnerPortalUnitService : IOwnerPortalUnitService
{
    private readonly IUnitOfWork _unitOfWork;

    public OwnerPortalUnitService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<OwnerPortalUnitOverview>> GetAllByOwnerAsync(
        Guid ownerId,
        bool? isActive = null,
        Guid? areaId = null,
        CancellationToken cancellationToken = default)
    {
        await ValidateOwnerAsync(ownerId, cancellationToken);

        var query = _unitOfWork.OwnerPortalUnitsOverview
            .Where(u => u.OwnerId == ownerId);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (areaId.HasValue)
            query = query.Where(u => u.AreaId == areaId.Value);

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<OwnerPortalUnitOverview?> GetByOwnerAndUnitIdAsync(
        Guid ownerId,
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        await ValidateOwnerAsync(ownerId, cancellationToken);

        var unit = await _unitOfWork.OwnerPortalUnitsOverview
            .Where(u => u.OwnerId == ownerId && u.UnitId == unitId)
            .FirstOrDefaultAsync(cancellationToken);

        if (unit is null)
            throw new NotFoundException($"Unit {unitId} not found in owner portal context.");

        return unit;
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private async Task ValidateOwnerAsync(Guid ownerId, CancellationToken cancellationToken)
    {
        var owner = await _unitOfWork.Owners.GetByIdAsync(ownerId, cancellationToken);

        if (owner is null)
            throw new NotFoundException($"Owner {ownerId} not found.");

        if (owner.Status != "active")
            throw new BusinessValidationException($"Owner {ownerId} is not active.");
    }
}
