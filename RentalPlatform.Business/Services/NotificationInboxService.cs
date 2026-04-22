using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Services;

public class NotificationInboxService : INotificationInboxService
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationInboxService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // -------------------------------------------------------------------------
    // Inbox reads
    // -------------------------------------------------------------------------

    public async Task<IReadOnlyList<NotificationListItemResult>> GetAdminInboxAsync(
        Guid adminUserId,
        bool unreadOnly = false,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        ValidatePagination(page, pageSize);

        var admin = await _unitOfWork.AdminUsers.GetByIdAsync(adminUserId, cancellationToken);
        if (admin == null)
            throw new NotFoundException($"AdminUser with ID {adminUserId} not found.");
        if (!admin.IsActive)
            throw new BusinessValidationException($"AdminUser with ID {adminUserId} is not active.");

        var query = BuildInboxQuery(unreadOnly)
            .Where(n => n.AdminUserId == adminUserId);

        return await ProjectAndPage(query, page, pageSize, cancellationToken);
    }

    public async Task<IReadOnlyList<NotificationListItemResult>> GetClientInboxAsync(
        Guid clientId,
        bool unreadOnly = false,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        ValidatePagination(page, pageSize);

        var client = await _unitOfWork.Clients.GetByIdAsync(clientId, cancellationToken);
        if (client == null)
            throw new NotFoundException($"Client with ID {clientId} not found.");
        if (!client.IsActive || client.DeletedAt != null)
            throw new BusinessValidationException($"Client with ID {clientId} is not active.");

        var query = BuildInboxQuery(unreadOnly)
            .Where(n => n.ClientId == clientId);

        return await ProjectAndPage(query, page, pageSize, cancellationToken);
    }

    public async Task<IReadOnlyList<NotificationListItemResult>> GetOwnerInboxAsync(
        Guid ownerId,
        bool unreadOnly = false,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        ValidatePagination(page, pageSize);

        var owner = await _unitOfWork.Owners.GetByIdAsync(ownerId, cancellationToken);
        if (owner == null)
            throw new NotFoundException($"Owner with ID {ownerId} not found.");
        if (owner.Status != "active" || owner.DeletedAt != null)
            throw new BusinessValidationException($"Owner with ID {ownerId} is not active.");

        var query = BuildInboxQuery(unreadOnly)
            .Where(n => n.OwnerId == ownerId);

        return await ProjectAndPage(query, page, pageSize, cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Inbox summaries
    // -------------------------------------------------------------------------

    public async Task<NotificationRecipientInboxSummaryResult> GetAdminInboxSummaryAsync(
        Guid adminUserId,
        CancellationToken cancellationToken = default)
    {
        var admin = await _unitOfWork.AdminUsers.GetByIdAsync(adminUserId, cancellationToken);
        if (admin == null)
            throw new NotFoundException($"AdminUser with ID {adminUserId} not found.");
        if (!admin.IsActive)
            throw new BusinessValidationException($"AdminUser with ID {adminUserId} is not active.");

        return await BuildSummaryAsync(
            n => n.AdminUserId == adminUserId, cancellationToken);
    }

    public async Task<NotificationRecipientInboxSummaryResult> GetClientInboxSummaryAsync(
        Guid clientId,
        CancellationToken cancellationToken = default)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(clientId, cancellationToken);
        if (client == null)
            throw new NotFoundException($"Client with ID {clientId} not found.");
        if (!client.IsActive || client.DeletedAt != null)
            throw new BusinessValidationException($"Client with ID {clientId} is not active.");

        return await BuildSummaryAsync(
            n => n.ClientId == clientId, cancellationToken);
    }

    public async Task<NotificationRecipientInboxSummaryResult> GetOwnerInboxSummaryAsync(
        Guid ownerId,
        CancellationToken cancellationToken = default)
    {
        var owner = await _unitOfWork.Owners.GetByIdAsync(ownerId, cancellationToken);
        if (owner == null)
            throw new NotFoundException($"Owner with ID {ownerId} not found.");
        if (owner.Status != "active" || owner.DeletedAt != null)
            throw new BusinessValidationException($"Owner with ID {ownerId} is not active.");

        return await BuildSummaryAsync(
            n => n.OwnerId == ownerId, cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Mark read
    // -------------------------------------------------------------------------

    public async Task<Notification> MarkAdminReadAsync(
        Guid notificationId,
        Guid adminUserId,
        CancellationToken cancellationToken = default)
    {
        return await MarkReadAsync(
            notificationId,
            n => n.AdminUserId == adminUserId,
            $"admin user {adminUserId}",
            cancellationToken);
    }

    public async Task<Notification> MarkClientReadAsync(
        Guid notificationId,
        Guid clientId,
        CancellationToken cancellationToken = default)
    {
        return await MarkReadAsync(
            notificationId,
            n => n.ClientId == clientId,
            $"client {clientId}",
            cancellationToken);
    }

    public async Task<Notification> MarkOwnerReadAsync(
        Guid notificationId,
        Guid ownerId,
        CancellationToken cancellationToken = default)
    {
        return await MarkReadAsync(
            notificationId,
            n => n.OwnerId == ownerId,
            $"owner {ownerId}",
            cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private static void ValidatePagination(int page, int pageSize)
    {
        if (page < 1)
            throw new BusinessValidationException("page must be >= 1.");
        if (pageSize < 1 || pageSize > 100)
            throw new BusinessValidationException("pageSize must be between 1 and 100.");
    }

    private IQueryable<Notification> BuildInboxQuery(bool unreadOnly)
    {
        var query = _unitOfWork.Notifications.Query()
            .Where(n => n.Channel == "in_app"
                     && (n.NotificationStatus == "delivered" || n.NotificationStatus == "read"));

        if (unreadOnly)
            query = query.Where(n => n.NotificationStatus == "delivered" && n.ReadAt == null);

        return query;
    }

    private static async Task<IReadOnlyList<NotificationListItemResult>> ProjectAndPage(
        IQueryable<Notification> query,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        return await query
            .OrderByDescending(n => n.CreatedAt)
            .ThenByDescending(n => n.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationListItemResult
            {
                NotificationId = n.Id,
                Channel = n.Channel,
                NotificationStatus = n.NotificationStatus,
                Subject = n.Subject,
                Body = n.Body,
                CreatedAt = n.CreatedAt,
                SentAt = n.SentAt,
                ReadAt = n.ReadAt
            })
            .ToListAsync(cancellationToken);
    }

    private async Task<NotificationRecipientInboxSummaryResult> BuildSummaryAsync(
        System.Linq.Expressions.Expression<Func<Notification, bool>> recipientFilter,
        CancellationToken cancellationToken)
    {
        var baseQuery = _unitOfWork.Notifications.Query()
            .Where(n => n.Channel == "in_app"
                     && (n.NotificationStatus == "delivered" || n.NotificationStatus == "read"))
            .Where(recipientFilter);

        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var unreadCount = await baseQuery
            .CountAsync(n => n.NotificationStatus == "delivered" && n.ReadAt == null, cancellationToken);

        return new NotificationRecipientInboxSummaryResult
        {
            TotalCount = totalCount,
            UnreadCount = unreadCount
        };
    }

    private async Task<Notification> MarkReadAsync(
        Guid notificationId,
        System.Linq.Expressions.Expression<Func<Notification, bool>> recipientFilter,
        string recipientDescription,
        CancellationToken cancellationToken)
    {
        var notification = await _unitOfWork.Notifications
            .Query()
            .Where(n => n.Id == notificationId)
            .Where(recipientFilter)
            .FirstOrDefaultAsync(cancellationToken);

        if (notification == null)
            throw new NotFoundException(
                $"Notification {notificationId} not found for {recipientDescription}.");

        if (notification.Channel != "in_app")
            throw new ConflictException(
                "Mark-read is only supported for in_app notifications.");

        if (notification.NotificationStatus != "delivered" && notification.NotificationStatus != "read")
            throw new ConflictException(
                $"Cannot mark notification as read from status '{notification.NotificationStatus}'. Allowed: delivered, read.");

        // Idempotent: already read — return without changes
        if (notification.NotificationStatus == "read")
            return notification;

        notification.NotificationStatus = "read";
        notification.ReadAt = DateTime.UtcNow;

        _unitOfWork.Notifications.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notification;
    }
}
