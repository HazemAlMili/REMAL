using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface INotificationService
{
    Task<IReadOnlyList<Notification>> GetAllAsync(
        string? notificationStatus = null,
        string? channel = null,
        Guid? templateId = null,
        CancellationToken cancellationToken = default);

    Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Notification> CreateForAdminAsync(
        string templateCode,
        string channel,
        Guid adminUserId,
        IReadOnlyDictionary<string, string>? variables = null,
        DateTime? scheduledAt = null,
        CancellationToken cancellationToken = default);

    Task<Notification> CreateForClientAsync(
        string templateCode,
        string channel,
        Guid clientId,
        IReadOnlyDictionary<string, string>? variables = null,
        DateTime? scheduledAt = null,
        CancellationToken cancellationToken = default);

    Task<Notification> CreateForOwnerAsync(
        string templateCode,
        string channel,
        Guid ownerId,
        IReadOnlyDictionary<string, string>? variables = null,
        DateTime? scheduledAt = null,
        CancellationToken cancellationToken = default);
}
