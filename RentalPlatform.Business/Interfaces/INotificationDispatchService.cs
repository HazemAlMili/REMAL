using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface INotificationDispatchService
{
    Task<Notification> QueueAsync(
        Guid notificationId,
        CancellationToken cancellationToken = default);

    Task<Notification> MarkSentAsync(
        Guid notificationId,
        string? providerName,
        string? providerMessageId,
        CancellationToken cancellationToken = default);

    Task<Notification> MarkDeliveredAsync(
        Guid notificationId,
        string? providerName,
        string? providerMessageId,
        CancellationToken cancellationToken = default);

    Task<Notification> MarkFailedAsync(
        Guid notificationId,
        string? errorMessage,
        string? providerName = null,
        string? providerMessageId = null,
        CancellationToken cancellationToken = default);

    Task<Notification> CancelAsync(
        Guid notificationId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificationDeliveryLog>> GetDeliveryLogsAsync(
        Guid notificationId,
        CancellationToken cancellationToken = default);
}
