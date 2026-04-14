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
using RentalPlatform.Shared.Enums;
using BCrypt.Net;

namespace RentalPlatform.Business.Services;

public class AdminUserService : IAdminUserService
{
    private readonly UnitOfWork _unitOfWork;

    public AdminUserService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<AdminUser>> GetAllAsync(bool includeInactive = true, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.AdminUsers.Query();

        if (!includeInactive)
        {
            query = query.Where(a => a.IsActive);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<AdminUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.AdminUsers.GetByIdAsync(id, cancellationToken);
    }

    public async Task<AdminUser> CreateAsync(string name, string email, string plainTextPassword, AdminRole role, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        var trimmedEmail = email?.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName)) throw new BusinessValidationException("Name is required.");
        if (string.IsNullOrWhiteSpace(trimmedEmail)) throw new BusinessValidationException("Email is required.");
        if (string.IsNullOrWhiteSpace(plainTextPassword)) throw new BusinessValidationException("Password is required.");

        if (!Enum.IsDefined(typeof(AdminRole), role))
        {
            throw new BusinessValidationException("Invalid role provided.");
        }

        var duplicateEmail = await _unitOfWork.AdminUsers.ExistsAsync(a => a.Email.ToLower() == trimmedEmail.ToLower(), cancellationToken);
        if (duplicateEmail) throw new ConflictException($"Admin user with email '{trimmedEmail}' already exists.");

        var adminUser = new AdminUser
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            Email = trimmedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(plainTextPassword, 12),
            Role = role,
            IsActive = true
        };

        await _unitOfWork.AdminUsers.AddAsync(adminUser, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return adminUser;
    }

    public async Task<AdminUser> UpdateRoleAsync(Guid id, AdminRole role, CancellationToken cancellationToken = default)
    {
        if (!Enum.IsDefined(typeof(AdminRole), role))
        {
            throw new BusinessValidationException("Invalid role provided.");
        }

        var adminUser = await _unitOfWork.AdminUsers.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Admin user with ID {id} not found.");

        adminUser.Role = role;

        _unitOfWork.AdminUsers.Update(adminUser);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return adminUser;
    }

    public async Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
    {
        var adminUser = await _unitOfWork.AdminUsers.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Admin user with ID {id} not found.");

        adminUser.IsActive = isActive;

        _unitOfWork.AdminUsers.Update(adminUser);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
