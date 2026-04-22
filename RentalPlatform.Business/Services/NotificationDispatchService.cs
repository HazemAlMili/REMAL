using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Services;

public class NotificationDispatchService : INotificationDispatchService
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationDispatchService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // -------------------------------------------------------------------------
    // QueueAsync — pending → queued (external channels only, no log row)
    // -------------------------------------------------------------------------

    public async Task<Notification> QueueAsync(
        Guid notificationId,
        CancellationToken cancellationToken = default)
    {
        var notification = await GetExistingAsync(notificationId, cancellationToken);

        AssertExternalChannel(notification);

        if (notification.NotificationStatus != "pending")
            throw new ConflictException(
                $"Cannot queue notification in status '{notification.NotificationStatus}'. Allowed: pending.");

        if (notification.ScheduledAt.HasValue && notification.ScheduledAt.Value > DateTime.UtcNow)
            throw new ConflictException(
                $"Notification is scheduled for {notification.ScheduledAt:O} and cannot be queued before its scheduled time.");

        notification.NotificationStatus = "queued";
        _unitOfWork.Notifications.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notification;
    }

    // -------------------------------------------------------------------------
    // MarkSentAsync — queued → sent + new delivery log row
    // -------------------------------------------------------------------------

    public async Task<Notification> MarkSentAsync(
        Guid notificationId,
        string? providerName,
        string? providerMessageId,
        CancellationToken cancellationToken = default)
    {
        var notification = await GetExistingAsync(notificationId, cancellationToken);

        AssertExternalChannel(notification);

        if (notification.NotificationStatus != "queued")
            throw new ConflictException(
                $"Cannot mark sent for notification in status '{notification.NotificationStatus}'. Allowed: queued.");

        var nextAttempt = await GetNextAttemptNumberAsync(notificationId, cancellationToken);

        var log = new NotificationDeliveryLog
        {
            Id = Guid.NewGuid(),
            NotificationId = notificationId,
            AttemptNumber = nextAttempt,
            DeliveryStatus = "sent",
            ProviderName = providerName?.Trim(),
            ProviderMessageId = providerMessageId?.Trim(),
            ErrorMessage = null,
            AttemptedAt = DateTime.UtcNow
        };

        var now = DateTime.UtcNow;
        notification.NotificationStatus = "sent";
        notification.SentAt = now;

        await _unitOfWork.NotificationDeliveryLogs.AddAsync(log, cancellationToken);
        _unitOfWork.Notifications.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notification;
    }

    // -------------------------------------------------------------------------
    // MarkDeliveredAsync — sent → delivered, update latest sent log row
    // -------------------------------------------------------------------------

    public async Task<Notification> MarkDeliveredAsync(
        Guid notificationId,
        string? providerName,
        string? providerMessageId,
        CancellationToken cancellationToken = default)
    {
        var notification = await GetExistingAsync(notificationId, cancellationToken);

        AssertExternalChannel(notification);

        if (notification.NotificationStatus != "sent")
            throw new ConflictException(
                $"Cannot mark delivered for notification in status '{notification.NotificationStatus}'. Allowed: sent.");

        var latestSentLog = await _unitOfWork.NotificationDeliveryLogs
            .Query()
            .Where(d => d.NotificationId == notificationId && d.DeliveryStatus == "sent")
            .OrderByDescending(d => d.AttemptNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (latestSentLog == null)
            throw new ConflictException(
                $"No delivery log row with status 'sent' found for notification {notificationId}.");

        latestSentLog.DeliveryStatus = "delivered";
        if (!string.IsNullOrWhiteSpace(providerName))
            latestSentLog.ProviderName = providerName.Trim();
        if (!string.IsNullOrWhiteSpace(providerMessageId))
            latestSentLog.ProviderMessageId = providerMessageId.Trim();

        notification.NotificationStatus = "delivered";

        _unitOfWork.NotificationDeliveryLogs.Update(latestSentLog);
        _unitOfWork.Notifications.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notification;
    }

    // -------------------------------------------------------------------------
    // MarkFailedAsync — queued → failed + new delivery log row
    // -------------------------------------------------------------------------

    public async Task<Notification> MarkFailedAsync(
        Guid notificationId,
        string? errorMessage,
        string? providerName = null,
        string? providerMessageId = null,
        CancellationToken cancellationToken = default)
    {
        var notification = await GetExistingAsync(notificationId, cancellationToken);

        AssertExternalChannel(notification);

        if (notification.NotificationStatus != "queued")
            throw new ConflictException(
                $"Cannot mark failed for notification in status '{notification.NotificationStatus}'. Allowed: queued.");

        var nextAttempt = await GetNextAttemptNumberAsync(notificationId, cancellationToken);

        var log = new NotificationDeliveryLog
        {
            Id = Guid.NewGuid(),
            NotificationId = notificationId,
            AttemptNumber = nextAttempt,
            DeliveryStatus = "failed",
            ProviderName = providerName?.Trim(),
            ProviderMessageId = providerMessageId?.Trim(),
            ErrorMessage = string.IsNullOrWhiteSpace(errorMessage) ? null : errorMessage.Trim(),
            AttemptedAt = DateTime.UtcNow
        };

        notification.NotificationStatus = "failed";

        await _unitOfWork.NotificationDeliveryLogs.AddAsync(log, cancellationToken);
        _unitOfWork.Notifications.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notification;
    }

    // -------------------------------------------------------------------------
    // CancelAsync — pending or queued → cancelled
    // -------------------------------------------------------------------------

    public async Task<Notification> CancelAsync(
        Guid notificationId,
        CancellationToken cancellationToken = default)
    {
        var notification = await GetExistingAsync(notificationId, cancellationToken);

        if (notification.NotificationStatus != "pending" && notification.NotificationStatus != "queued")
            throw new ConflictException(
                $"Cannot cancel notification in status '{notification.NotificationStatus}'. Allowed: pending, queued.");

        notification.NotificationStatus = "cancelled";
        _unitOfWork.Notifications.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notification;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private async Task<Notification> GetExistingAsync(Guid notificationId, CancellationToken cancellationToken)
    {
        var notification = await _unitOfWork.Notifications.GetByIdAsync(notificationId, cancellationToken);
        if (notification == null)
            throw new NotFoundException($"Notification with ID {notificationId} not found.");
        return notification;
    }

    private static void AssertExternalChannel(Notification notification)
    {
        if (notification.Channel == "in_app")
            throw new ConflictException(
                "Dispatch service does not handle in_app notifications. in_app notifications are immediately delivered on creation.");
    }

    private async Task<int> GetNextAttemptNumberAsync(Guid notificationId, CancellationToken cancellationToken)
    {
        var maxAttempt = await _unitOfWork.NotificationDeliveryLogs
            .Query()
            .Where(d => d.NotificationId == notificationId)
            .Select(d => (int?)d.AttemptNumber)
            .MaxAsync(cancellationToken);

        return (maxAttempt ?? 0) + 1;
    }

    // -------------------------------------------------------------------------
    // GetDeliveryLogsAsync — read all delivery logs for a notification
    // -------------------------------------------------------------------------

    public async Task<IReadOnlyList<NotificationDeliveryLog>> GetDeliveryLogsAsync(
        Guid notificationId,
        CancellationToken cancellationToken = default)
    {
        await GetExistingAsync(notificationId, cancellationToken);

        return await _unitOfWork.NotificationDeliveryLogs
            .Query()
            .Where(d => d.NotificationId == notificationId)
            .OrderBy(d => d.AttemptNumber)
            .ToListAsync(cancellationToken);
    }
}
