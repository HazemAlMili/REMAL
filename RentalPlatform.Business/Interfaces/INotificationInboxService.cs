using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Models;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Interfaces;

public interface INotificationInboxService
{
    Task<IReadOnlyList<NotificationListItemResult>> GetAdminInboxAsync(
        Guid adminUserId,
        bool unreadOnly = false,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificationListItemResult>> GetClientInboxAsync(
        Guid clientId,
        bool unreadOnly = false,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificationListItemResult>> GetOwnerInboxAsync(
        Guid ownerId,
        bool unreadOnly = false,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<Notification> MarkAdminReadAsync(
        Guid notificationId,
        Guid adminUserId,
        CancellationToken cancellationToken = default);

    Task<Notification> MarkClientReadAsync(
        Guid notificationId,
        Guid clientId,
        CancellationToken cancellationToken = default);

    Task<Notification> MarkOwnerReadAsync(
        Guid notificationId,
        Guid ownerId,
        CancellationToken cancellationToken = default);

    Task<NotificationRecipientInboxSummaryResult> GetAdminInboxSummaryAsync(
        Guid adminUserId,
        CancellationToken cancellationToken = default);

    Task<NotificationRecipientInboxSummaryResult> GetClientInboxSummaryAsync(
        Guid clientId,
        CancellationToken cancellationToken = default);

    Task<NotificationRecipientInboxSummaryResult> GetOwnerInboxSummaryAsync(
        Guid ownerId,
        CancellationToken cancellationToken = default);
}
