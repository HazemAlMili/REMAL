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
using BCrypt.Net;

namespace RentalPlatform.Business.Services;

public class OwnerService : IOwnerService
{
    private readonly UnitOfWork _unitOfWork;

    public OwnerService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<Owner>> GetAllAsync(bool includeInactive = true, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Owners.Query();

        if (!includeInactive)
        {
            query = query.Where(o => o.Status == "active");
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Owner?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Owners.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Owner> CreateAsync(string name, string phone, string? email, decimal commissionRate, string? notes, string status, string plainTextPassword, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        var trimmedPhone = phone?.Trim();
        var trimmedEmail = email?.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName)) throw new BusinessValidationException("Name is required.");
        if (string.IsNullOrWhiteSpace(trimmedPhone)) throw new BusinessValidationException("Phone is required.");
        if (string.IsNullOrWhiteSpace(plainTextPassword)) throw new BusinessValidationException("Password cannot be empty.");

        if (commissionRate < 0 || commissionRate > 100)
        {
            throw new BusinessValidationException("Commission rate must be between 0 and 100.");
        }

        if (status != "active" && status != "inactive")
        {
            throw new BusinessValidationException("Status must be either 'active' or 'inactive'.");
        }

        var uniquePhone = await _unitOfWork.Owners.ExistsAsync(o => o.Phone == trimmedPhone, cancellationToken);
        if (uniquePhone) throw new ConflictException($"Owner with phone '{trimmedPhone}' already exists.");

        if (!string.IsNullOrWhiteSpace(trimmedEmail))
        {
            var uniqueEmail = await _unitOfWork.Owners.ExistsAsync(o => o.Email != null && o.Email.ToLower() == trimmedEmail.ToLower(), cancellationToken);
            if (uniqueEmail) throw new ConflictException($"Owner with email '{trimmedEmail}' already exists.");
        }

        var owner = new Owner
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            Phone = trimmedPhone,
            Email = string.IsNullOrWhiteSpace(trimmedEmail) ? null : trimmedEmail,
            CommissionRate = commissionRate,
            Notes = notes,
            Status = status,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(plainTextPassword, 12)
        };

        await _unitOfWork.Owners.AddAsync(owner, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return owner;
    }

    public async Task<Owner> UpdateAsync(Guid id, string name, string phone, string? email, decimal commissionRate, string? notes, string status, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        var trimmedPhone = phone?.Trim();
        var trimmedEmail = email?.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName)) throw new BusinessValidationException("Name is required.");
        if (string.IsNullOrWhiteSpace(trimmedPhone)) throw new BusinessValidationException("Phone is required.");

        if (commissionRate < 0 || commissionRate > 100)
        {
            throw new BusinessValidationException("Commission rate must be between 0 and 100.");
        }

        if (status != "active" && status != "inactive")
        {
            throw new BusinessValidationException("Status must be either 'active' or 'inactive'.");
        }

        var owner = await _unitOfWork.Owners.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Owner with ID {id} not found.");

        var duplicatePhone = await _unitOfWork.Owners.ExistsAsync(o => o.Phone == trimmedPhone && o.Id != id, cancellationToken);
        if (duplicatePhone) throw new ConflictException($"Owner with phone '{trimmedPhone}' already exists.");

        if (!string.IsNullOrWhiteSpace(trimmedEmail))
        {
            var duplicateEmail = await _unitOfWork.Owners.ExistsAsync(o => o.Email != null && o.Email.ToLower() == trimmedEmail.ToLower() && o.Id != id, cancellationToken);
            if (duplicateEmail) throw new ConflictException($"Owner with email '{trimmedEmail}' already exists.");
        }

        owner.Name = trimmedName;
        owner.Phone = trimmedPhone;
        owner.Email = string.IsNullOrWhiteSpace(trimmedEmail) ? null : trimmedEmail;
        owner.CommissionRate = commissionRate;
        owner.Notes = notes;
        owner.Status = status;

        _unitOfWork.Owners.Update(owner);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return owner;
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var owner = await _unitOfWork.Owners.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Owner with ID {id} not found.");

        _unitOfWork.Owners.Delete(owner);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
