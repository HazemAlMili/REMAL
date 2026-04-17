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

public class UnitImageService : IUnitImageService
{
    private readonly IUnitOfWork _unitOfWork;

    public UnitImageService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<UnitImage>> GetByUnitIdAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.UnitImages.Query()
            .Where(img => img.UnitId == unitId)
            .OrderBy(img => img.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<UnitImage> AddAsync(Guid unitId, string fileKey, bool isCover, int displayOrder, CancellationToken cancellationToken = default)
    {
        var unitExists = await _unitOfWork.Units.ExistsAsync(u => u.Id == unitId, cancellationToken);
        if (!unitExists)
            throw new NotFoundException($"Unit with ID {unitId} not found");

        if (string.IsNullOrWhiteSpace(fileKey))
            throw new BusinessValidationException("FileKey is required");

        if (displayOrder < 0)
            throw new BusinessValidationException("Display order must be non-negative");

        if (isCover)
        {
            var existingImages = await _unitOfWork.UnitImages.Query()
                .Where(img => img.UnitId == unitId)
                .ToListAsync(cancellationToken);

            foreach (var img in existingImages.Where(i => i.IsCover))
            {
                img.IsCover = false;
                _unitOfWork.UnitImages.Update(img);
            }
        }

        var image = new UnitImage
        {
            UnitId = unitId,
            FileKey = fileKey.Trim(),
            IsCover = isCover,
            DisplayOrder = displayOrder
        };

        await _unitOfWork.UnitImages.AddAsync(image, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return image;
    }

    public async Task RemoveAsync(Guid unitId, Guid imageId, CancellationToken cancellationToken = default)
    {
        var image = await _unitOfWork.UnitImages.GetByIdAsync(imageId, cancellationToken);
        if (image == null || image.UnitId != unitId)
            throw new NotFoundException($"Image {imageId} not found for unit {unitId}");

        _unitOfWork.UnitImages.Delete(image);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ReorderAsync(Guid unitId, IReadOnlyList<(Guid ImageId, int DisplayOrder)> ordering, CancellationToken cancellationToken = default)
    {
        var unitExists = await _unitOfWork.Units.ExistsAsync(u => u.Id == unitId, cancellationToken);
        if (!unitExists)
            throw new NotFoundException($"Unit with ID {unitId} not found");

        var images = await _unitOfWork.UnitImages.Query()
            .Where(img => img.UnitId == unitId)
            .ToListAsync(cancellationToken);

        foreach (var mapping in ordering)
        {
            if (mapping.DisplayOrder < 0)
                throw new BusinessValidationException("Display orders must be non-negative");

            var imgToUpdate = images.FirstOrDefault(i => i.Id == mapping.ImageId);
            if (imgToUpdate == null)
                throw new BusinessValidationException($"Image {mapping.ImageId} does not belong to unit {unitId}");

            imgToUpdate.DisplayOrder = mapping.DisplayOrder;
            _unitOfWork.UnitImages.Update(imgToUpdate);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task SetCoverAsync(Guid unitId, Guid imageId, CancellationToken cancellationToken = default)
    {
        var unitExists = await _unitOfWork.Units.ExistsAsync(u => u.Id == unitId, cancellationToken);
        if (!unitExists)
            throw new NotFoundException($"Unit with ID {unitId} not found");

        var images = await _unitOfWork.UnitImages.Query()
            .Where(img => img.UnitId == unitId)
            .ToListAsync(cancellationToken);

        var targetImage = images.FirstOrDefault(i => i.Id == imageId);
        if (targetImage == null)
            throw new NotFoundException($"Image {imageId} not found for unit {unitId}");

        foreach (var img in images)
        {
            if (img.Id == imageId)
            {
                img.IsCover = true;
            }
            else if (img.IsCover)
            {
                img.IsCover = false;
            }
            _unitOfWork.UnitImages.Update(img);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
