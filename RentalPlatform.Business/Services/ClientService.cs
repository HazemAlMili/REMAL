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

public class ClientService : IClientService
{
    private readonly IUnitOfWork _unitOfWork;

    public ClientService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<Client>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Clients.Query();

        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Clients.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Client> CreateAsync(string name, string phone, string? email, string plainTextPassword, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        var trimmedPhone = phone?.Trim();
        var trimmedEmail = email?.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName)) throw new BusinessValidationException("Name is required.");
        if (string.IsNullOrWhiteSpace(trimmedPhone)) throw new BusinessValidationException("Phone is required.");
        if (string.IsNullOrWhiteSpace(plainTextPassword)) throw new BusinessValidationException("Password is required.");

        var duplicatePhone = await _unitOfWork.Clients.ExistsAsync(c => c.Phone == trimmedPhone, cancellationToken);
        if (duplicatePhone) throw new ConflictException($"Client with phone '{trimmedPhone}' already exists.");

        if (!string.IsNullOrWhiteSpace(trimmedEmail))
        {
            var duplicateEmail = await _unitOfWork.Clients.ExistsAsync(c => c.Email != null && c.Email.ToLower() == trimmedEmail.ToLower(), cancellationToken);
            if (duplicateEmail) throw new ConflictException($"Client with email '{trimmedEmail}' already exists.");
        }

        var client = new Client
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            Phone = trimmedPhone,
            Email = string.IsNullOrWhiteSpace(trimmedEmail) ? null : trimmedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(plainTextPassword, 12),
            IsActive = true
        };

        await _unitOfWork.Clients.AddAsync(client, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return client;
    }

    public async Task<Client> UpdateAsync(Guid id, string name, string phone, string? email, bool isActive, CancellationToken cancellationToken = default)
    {
        var trimmedName = name?.Trim();
        var trimmedPhone = phone?.Trim();
        var trimmedEmail = email?.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName)) throw new BusinessValidationException("Name is required.");
        if (string.IsNullOrWhiteSpace(trimmedPhone)) throw new BusinessValidationException("Phone is required.");

        var client = await _unitOfWork.Clients.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Client with ID {id} not found.");

        var duplicatePhone = await _unitOfWork.Clients.ExistsAsync(c => c.Phone == trimmedPhone && c.Id != id, cancellationToken);
        if (duplicatePhone) throw new ConflictException($"Client with phone '{trimmedPhone}' already exists.");

        if (!string.IsNullOrWhiteSpace(trimmedEmail))
        {
            var duplicateEmail = await _unitOfWork.Clients.ExistsAsync(c => c.Email != null && c.Email.ToLower() == trimmedEmail.ToLower() && c.Id != id, cancellationToken);
            if (duplicateEmail) throw new ConflictException($"Client with email '{trimmedEmail}' already exists.");
        }

        client.Name = trimmedName;
        client.Phone = trimmedPhone;
        client.Email = string.IsNullOrWhiteSpace(trimmedEmail) ? null : trimmedEmail;
        client.IsActive = isActive;

        _unitOfWork.Clients.Update(client);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return client;
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Client with ID {id} not found.");

        _unitOfWork.Clients.Delete(client);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
