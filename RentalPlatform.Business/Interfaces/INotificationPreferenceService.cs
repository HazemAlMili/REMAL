using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface INotificationPreferenceService
{
    Task<IReadOnlyList<NotificationPreference>> GetForAdminAsync(
        Guid adminUserId,
        string? channel = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificationPreference>> GetForClientAsync(
        Guid clientId,
        string? channel = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificationPreference>> GetForOwnerAsync(
        Guid ownerId,
        string? channel = null,
        CancellationToken cancellationToken = default);

    Task<NotificationPreference> UpsertForAdminAsync(
        Guid adminUserId,
        string channel,
        string preferenceKey,
        bool isEnabled,
        CancellationToken cancellationToken = default);

    Task<NotificationPreference> UpsertForClientAsync(
        Guid clientId,
        string channel,
        string preferenceKey,
        bool isEnabled,
        CancellationToken cancellationToken = default);

    Task<NotificationPreference> UpsertForOwnerAsync(
        Guid ownerId,
        string channel,
        string preferenceKey,
        bool isEnabled,
        CancellationToken cancellationToken = default);
}
