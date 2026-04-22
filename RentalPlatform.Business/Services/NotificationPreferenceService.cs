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

public class NotificationPreferenceService : INotificationPreferenceService
{
    private readonly IUnitOfWork _unitOfWork;

    private static readonly HashSet<string> AllowedChannels = new(StringComparer.Ordinal)
    {
        "in_app", "email", "sms", "whatsapp"
    };

    public NotificationPreferenceService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // -------------------------------------------------------------------------
    // Get — Admin
    // -------------------------------------------------------------------------

    public async Task<IReadOnlyList<NotificationPreference>> GetForAdminAsync(
        Guid adminUserId,
        string? channel = null,
        CancellationToken cancellationToken = default)
    {
        var admin = await _unitOfWork.AdminUsers.GetByIdAsync(adminUserId, cancellationToken);
        if (admin == null)
            throw new NotFoundException($"AdminUser with ID {adminUserId} not found.");
        if (!admin.IsActive)
            throw new BusinessValidationException($"AdminUser with ID {adminUserId} is not active.");

        var query = _unitOfWork.NotificationPreferences.Query()
            .Where(p => p.AdminUserId == adminUserId);

        if (!string.IsNullOrWhiteSpace(channel))
        {
            var normalizedChannel = channel.Trim().ToLower();
            query = query.Where(p => p.Channel == normalizedChannel);
        }

        return await query.ToListAsync(cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Get — Client
    // -------------------------------------------------------------------------

    public async Task<IReadOnlyList<NotificationPreference>> GetForClientAsync(
        Guid clientId,
        string? channel = null,
        CancellationToken cancellationToken = default)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(clientId, cancellationToken);
        if (client == null)
            throw new NotFoundException($"Client with ID {clientId} not found.");
        if (!client.IsActive || client.DeletedAt != null)
            throw new BusinessValidationException($"Client with ID {clientId} is not active.");

        var query = _unitOfWork.NotificationPreferences.Query()
            .Where(p => p.ClientId == clientId);

        if (!string.IsNullOrWhiteSpace(channel))
        {
            var normalizedChannel = channel.Trim().ToLower();
            query = query.Where(p => p.Channel == normalizedChannel);
        }

        return await query.ToListAsync(cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Get — Owner
    // -------------------------------------------------------------------------

    public async Task<IReadOnlyList<NotificationPreference>> GetForOwnerAsync(
        Guid ownerId,
        string? channel = null,
        CancellationToken cancellationToken = default)
    {
        var owner = await _unitOfWork.Owners.GetByIdAsync(ownerId, cancellationToken);
        if (owner == null)
            throw new NotFoundException($"Owner with ID {ownerId} not found.");
        if (owner.Status != "active" || owner.DeletedAt != null)
            throw new BusinessValidationException($"Owner with ID {ownerId} is not active.");

        var query = _unitOfWork.NotificationPreferences.Query()
            .Where(p => p.OwnerId == ownerId);

        if (!string.IsNullOrWhiteSpace(channel))
        {
            var normalizedChannel = channel.Trim().ToLower();
            query = query.Where(p => p.Channel == normalizedChannel);
        }

        return await query.ToListAsync(cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Upsert — Admin
    // -------------------------------------------------------------------------

    public async Task<NotificationPreference> UpsertForAdminAsync(
        Guid adminUserId,
        string channel,
        string preferenceKey,
        bool isEnabled,
        CancellationToken cancellationToken = default)
    {
        var (normalizedChannel, normalizedKey) = ValidateChannelAndKey(channel, preferenceKey);

        var admin = await _unitOfWork.AdminUsers.GetByIdAsync(adminUserId, cancellationToken);
        if (admin == null)
            throw new NotFoundException($"AdminUser with ID {adminUserId} not found.");
        if (!admin.IsActive)
            throw new BusinessValidationException($"AdminUser with ID {adminUserId} is not active.");

        var existing = await _unitOfWork.NotificationPreferences.FirstOrDefaultAsync(
            p => p.AdminUserId == adminUserId
              && p.Channel == normalizedChannel
              && p.PreferenceKey == normalizedKey,
            cancellationToken);

        if (existing != null)
        {
            existing.IsEnabled = isEnabled;
            _unitOfWork.NotificationPreferences.Update(existing);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return existing;
        }

        var preference = new NotificationPreference
        {
            Id = Guid.NewGuid(),
            AdminUserId = adminUserId,
            ClientId = null,
            OwnerId = null,
            Channel = normalizedChannel,
            PreferenceKey = normalizedKey,
            IsEnabled = isEnabled
        };

        await _unitOfWork.NotificationPreferences.AddAsync(preference, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return preference;
    }

    // -------------------------------------------------------------------------
    // Upsert — Client
    // -------------------------------------------------------------------------

    public async Task<NotificationPreference> UpsertForClientAsync(
        Guid clientId,
        string channel,
        string preferenceKey,
        bool isEnabled,
        CancellationToken cancellationToken = default)
    {
        var (normalizedChannel, normalizedKey) = ValidateChannelAndKey(channel, preferenceKey);

        var client = await _unitOfWork.Clients.GetByIdAsync(clientId, cancellationToken);
        if (client == null)
            throw new NotFoundException($"Client with ID {clientId} not found.");
        if (!client.IsActive || client.DeletedAt != null)
            throw new BusinessValidationException($"Client with ID {clientId} is not active.");

        var existing = await _unitOfWork.NotificationPreferences.FirstOrDefaultAsync(
            p => p.ClientId == clientId
              && p.Channel == normalizedChannel
              && p.PreferenceKey == normalizedKey,
            cancellationToken);

        if (existing != null)
        {
            existing.IsEnabled = isEnabled;
            _unitOfWork.NotificationPreferences.Update(existing);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return existing;
        }

        var preference = new NotificationPreference
        {
            Id = Guid.NewGuid(),
            AdminUserId = null,
            ClientId = clientId,
            OwnerId = null,
            Channel = normalizedChannel,
            PreferenceKey = normalizedKey,
            IsEnabled = isEnabled
        };

        await _unitOfWork.NotificationPreferences.AddAsync(preference, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return preference;
    }

    // -------------------------------------------------------------------------
    // Upsert — Owner
    // -------------------------------------------------------------------------

    public async Task<NotificationPreference> UpsertForOwnerAsync(
        Guid ownerId,
        string channel,
        string preferenceKey,
        bool isEnabled,
        CancellationToken cancellationToken = default)
    {
        var (normalizedChannel, normalizedKey) = ValidateChannelAndKey(channel, preferenceKey);

        var owner = await _unitOfWork.Owners.GetByIdAsync(ownerId, cancellationToken);
        if (owner == null)
            throw new NotFoundException($"Owner with ID {ownerId} not found.");
        if (owner.Status != "active" || owner.DeletedAt != null)
            throw new BusinessValidationException($"Owner with ID {ownerId} is not active.");

        var existing = await _unitOfWork.NotificationPreferences.FirstOrDefaultAsync(
            p => p.OwnerId == ownerId
              && p.Channel == normalizedChannel
              && p.PreferenceKey == normalizedKey,
            cancellationToken);

        if (existing != null)
        {
            existing.IsEnabled = isEnabled;
            _unitOfWork.NotificationPreferences.Update(existing);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return existing;
        }

        var preference = new NotificationPreference
        {
            Id = Guid.NewGuid(),
            AdminUserId = null,
            ClientId = null,
            OwnerId = ownerId,
            Channel = normalizedChannel,
            PreferenceKey = normalizedKey,
            IsEnabled = isEnabled
        };

        await _unitOfWork.NotificationPreferences.AddAsync(preference, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return preference;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private static (string normalizedChannel, string normalizedKey) ValidateChannelAndKey(
        string channel, string preferenceKey)
    {
        var normalizedChannel = channel?.Trim().ToLower();
        if (string.IsNullOrWhiteSpace(normalizedChannel) || !AllowedChannels.Contains(normalizedChannel))
            throw new BusinessValidationException(
                $"Invalid channel '{channel}'. Allowed values: in_app, email, sms, whatsapp.");

        var normalizedKey = preferenceKey?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedKey))
            throw new BusinessValidationException("preferenceKey is required.");

        return (normalizedChannel, normalizedKey);
    }
}
