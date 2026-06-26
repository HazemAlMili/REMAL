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

public class ProjectService : IProjectService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProjectService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<Project>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Projects.Query();

        if (!includeInactive)
        {
            query = query.Where(a => a.IsActive);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Projects.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Project> CreateAsync(string name, string? description, bool isActive = true, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new BusinessValidationException("Project name cannot be empty.");
        }

        var exists = await _unitOfWork.Projects.ExistsAsync(a => a.Name.ToLower() == trimmedName.ToLower(), cancellationToken);
        if (exists)
        {
            throw new ConflictException($"Project with name '{trimmedName}' already exists.");
        }

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            Description = description,
            IsActive = isActive
        };

        await _unitOfWork.Projects.AddAsync(project, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return project;
    }

    public async Task<Project> UpdateAsync(Guid id, string name, string? description, bool isActive, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new BusinessValidationException("Project name cannot be empty.");
        }

        var project = await _unitOfWork.Projects.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Project with ID {id} not found.");

        var exists = await _unitOfWork.Projects.ExistsAsync(a => a.Name.ToLower() == trimmedName.ToLower() && a.Id != id, cancellationToken);
        if (exists)
        {
            throw new ConflictException($"Project with name '{trimmedName}' already exists.");
        }

        project.Name = trimmedName;
        project.Description = description;
        project.IsActive = isActive;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return project;
    }

    public async Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Project with ID {id} not found.");

        project.IsActive = isActive;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
