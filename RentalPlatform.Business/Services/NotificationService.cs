using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;

    private static readonly HashSet<string> AllowedChannels = new(StringComparer.Ordinal)
    {
        "in_app", "email", "sms", "whatsapp"
    };

    public NotificationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    public async Task<IReadOnlyList<Notification>> GetAllAsync(
        string? notificationStatus = null,
        string? channel = null,
        Guid? templateId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Notifications.Query();

        if (!string.IsNullOrWhiteSpace(notificationStatus))
            query = query.Where(n => n.NotificationStatus == notificationStatus.Trim());

        if (!string.IsNullOrWhiteSpace(channel))
            query = query.Where(n => n.Channel == channel.Trim().ToLower());

        if (templateId.HasValue)
            query = query.Where(n => n.TemplateId == templateId.Value);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Notifications.GetByIdAsync(id, cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Creation — Admin
    // -------------------------------------------------------------------------

    public async Task<Notification> CreateForAdminAsync(
        string templateCode,
        string channel,
        Guid adminUserId,
        IReadOnlyDictionary<string, string>? variables = null,
        DateTime? scheduledAt = null,
        CancellationToken cancellationToken = default)
    {
        var (normalizedCode, normalizedChannel) = ValidateInputs(templateCode, channel);

        var admin = await _unitOfWork.AdminUsers.GetByIdAsync(adminUserId, cancellationToken);
        if (admin == null)
            throw new NotFoundException($"AdminUser with ID {adminUserId} not found.");
        if (!admin.IsActive)
            throw new BusinessValidationException($"AdminUser with ID {adminUserId} is not active.");

        NotificationTemplateDefinition templateDef;
        try
        {
            templateDef = NotificationTemplateRegistry.Get(normalizedCode);
        }
        catch (KeyNotFoundException ex)
        {
            throw new BusinessValidationException(ex.Message);
        }

        var isChannelAllowed = templateDef.AllowedChannels.Any(c => 
            string.Equals(c.ToLowerInvariant().Replace("_", "").Replace("-", ""), 
                          normalizedChannel.ToLowerInvariant().Replace("_", "").Replace("-", "")));
        if (!isChannelAllowed)
        {
            throw new BusinessValidationException($"Channel '{channel}' is not allowed for template '{templateCode}'. Allowed channels: {string.Join(", ", templateDef.AllowedChannels)}.");
        }

        var templateId = await EnsureTemplateInDbAsync(normalizedCode, normalizedChannel, "admin", templateDef, cancellationToken);

        EnforceNoSchedulingForInApp(normalizedChannel, scheduledAt);

        var isCancelled = await IsPreferenceCancelledAsync(
            adminUserId, null, null, normalizedChannel, normalizedCode, cancellationToken);

        var renderedSubject = string.IsNullOrEmpty(templateDef.DefaultTitle) ? null : RenderTemplate(templateDef.DefaultTitle, variables);
        var renderedBody = RenderTemplate(templateDef.DefaultBody, variables);

        DetermineStatusAndTimestamps(normalizedChannel, scheduledAt, isCancelled,
            out var status, out var sentAt, out var resolvedScheduledAt);

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            TemplateId = templateId,
            AdminUserId = adminUserId,
            ClientId = null,
            OwnerId = null,
            Channel = normalizedChannel,
            NotificationStatus = status,
            Subject = renderedSubject,
            Body = renderedBody,
            ScheduledAt = resolvedScheduledAt,
            SentAt = sentAt,
            ReadAt = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notification;
    }

    // -------------------------------------------------------------------------
    // Creation — Client
    // -------------------------------------------------------------------------

    public async Task<Notification> CreateForClientAsync(
        string templateCode,
        string channel,
        Guid clientId,
        IReadOnlyDictionary<string, string>? variables = null,
        DateTime? scheduledAt = null,
        CancellationToken cancellationToken = default)
    {
        var (normalizedCode, normalizedChannel) = ValidateInputs(templateCode, channel);

        var client = await _unitOfWork.Clients.GetByIdAsync(clientId, cancellationToken);
        if (client == null)
            throw new NotFoundException($"Client with ID {clientId} not found.");
        if (!client.IsActive || client.DeletedAt != null)
            throw new BusinessValidationException($"Client with ID {clientId} is not active.");

        NotificationTemplateDefinition templateDef;
        try
        {
            templateDef = NotificationTemplateRegistry.Get(normalizedCode);
        }
        catch (KeyNotFoundException ex)
        {
            throw new BusinessValidationException(ex.Message);
        }

        var isChannelAllowed = templateDef.AllowedChannels.Any(c => 
            string.Equals(c.ToLowerInvariant().Replace("_", "").Replace("-", ""), 
                          normalizedChannel.ToLowerInvariant().Replace("_", "").Replace("-", "")));
        if (!isChannelAllowed)
        {
            throw new BusinessValidationException($"Channel '{channel}' is not allowed for template '{templateCode}'. Allowed channels: {string.Join(", ", templateDef.AllowedChannels)}.");
        }

        var templateId = await EnsureTemplateInDbAsync(normalizedCode, normalizedChannel, "client", templateDef, cancellationToken);

        EnforceNoSchedulingForInApp(normalizedChannel, scheduledAt);

        var isCancelled = await IsPreferenceCancelledAsync(
            null, clientId, null, normalizedChannel, normalizedCode, cancellationToken);

        var renderedSubject = string.IsNullOrEmpty(templateDef.DefaultTitle) ? null : RenderTemplate(templateDef.DefaultTitle, variables);
        var renderedBody = RenderTemplate(templateDef.DefaultBody, variables);

        DetermineStatusAndTimestamps(normalizedChannel, scheduledAt, isCancelled,
            out var status, out var sentAt, out var resolvedScheduledAt);

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            TemplateId = templateId,
            AdminUserId = null,
            ClientId = clientId,
            OwnerId = null,
            Channel = normalizedChannel,
            NotificationStatus = status,
            Subject = renderedSubject,
            Body = renderedBody,
            ScheduledAt = resolvedScheduledAt,
            SentAt = sentAt,
            ReadAt = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notification;
    }

    // -------------------------------------------------------------------------
    // Creation — Owner
    // -------------------------------------------------------------------------

    public async Task<Notification> CreateForOwnerAsync(
        string templateCode,
        string channel,
        Guid ownerId,
        IReadOnlyDictionary<string, string>? variables = null,
        DateTime? scheduledAt = null,
        CancellationToken cancellationToken = default)
    {
        var (normalizedCode, normalizedChannel) = ValidateInputs(templateCode, channel);

        var owner = await _unitOfWork.Owners.GetByIdAsync(ownerId, cancellationToken);
        if (owner == null)
            throw new NotFoundException($"Owner with ID {ownerId} not found.");
        if (owner.Status != "active" || owner.DeletedAt != null)
            throw new BusinessValidationException($"Owner with ID {ownerId} is not active.");

        NotificationTemplateDefinition templateDef;
        try
        {
            templateDef = NotificationTemplateRegistry.Get(normalizedCode);
        }
        catch (KeyNotFoundException ex)
        {
            throw new BusinessValidationException(ex.Message);
        }

        var isChannelAllowed = templateDef.AllowedChannels.Any(c => 
            string.Equals(c.ToLowerInvariant().Replace("_", "").Replace("-", ""), 
                          normalizedChannel.ToLowerInvariant().Replace("_", "").Replace("-", "")));
        if (!isChannelAllowed)
        {
            throw new BusinessValidationException($"Channel '{channel}' is not allowed for template '{templateCode}'. Allowed channels: {string.Join(", ", templateDef.AllowedChannels)}.");
        }

        var templateId = await EnsureTemplateInDbAsync(normalizedCode, normalizedChannel, "owner", templateDef, cancellationToken);

        EnforceNoSchedulingForInApp(normalizedChannel, scheduledAt);

        var isCancelled = await IsPreferenceCancelledAsync(
            null, null, ownerId, normalizedChannel, normalizedCode, cancellationToken);

        var renderedSubject = string.IsNullOrEmpty(templateDef.DefaultTitle) ? null : RenderTemplate(templateDef.DefaultTitle, variables);
        var renderedBody = RenderTemplate(templateDef.DefaultBody, variables);

        DetermineStatusAndTimestamps(normalizedChannel, scheduledAt, isCancelled,
            out var status, out var sentAt, out var resolvedScheduledAt);

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            TemplateId = templateId,
            AdminUserId = null,
            ClientId = null,
            OwnerId = ownerId,
            Channel = normalizedChannel,
            NotificationStatus = status,
            Subject = renderedSubject,
            Body = renderedBody,
            ScheduledAt = resolvedScheduledAt,
            SentAt = sentAt,
            ReadAt = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notification;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private static (string normalizedCode, string normalizedChannel) ValidateInputs(
        string templateCode, string channel)
    {
        var normalizedCode = templateCode?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedCode))
            throw new BusinessValidationException("templateCode is required.");

        var normalizedChannel = channel?.Trim().ToLower();
        if (string.IsNullOrWhiteSpace(normalizedChannel) || !AllowedChannels.Contains(normalizedChannel))
            throw new BusinessValidationException(
                $"Invalid channel '{channel}'. Allowed values: in_app, email, sms, whatsapp.");

        return (normalizedCode, normalizedChannel);
    }

    private static Guid GetDeterministicGuid(string input)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input.ToLowerInvariant()));
        return new Guid(hash);
    }

    private async Task<Guid> EnsureTemplateInDbAsync(
        string templateCode, 
        string channel, 
        string recipientRole, 
        NotificationTemplateDefinition def, 
        CancellationToken cancellationToken)
    {
        var key = $"{templateCode.ToLowerInvariant()}_{channel.ToLowerInvariant()}_{recipientRole.ToLowerInvariant()}";
        var templateId = GetDeterministicGuid(key);

        var template = await _unitOfWork.NotificationTemplates.GetByIdAsync(templateId, cancellationToken);
        if (template == null)
        {
            template = new NotificationTemplate
            {
                Id = templateId,
                TemplateCode = templateCode,
                Channel = channel.ToLowerInvariant(),
                RecipientRole = recipientRole.ToLowerInvariant(),
                SubjectTemplate = def.DefaultTitle,
                BodyTemplate = def.DefaultBody,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.NotificationTemplates.AddAsync(template, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        return templateId;
    }

    private static string NormalizeKey(string key)
    {
        if (string.IsNullOrEmpty(key))
            return string.Empty;
        return key.Replace("_", "").Replace("-", "").ToLowerInvariant();
    }

    private static string RenderTemplate(string template, IReadOnlyDictionary<string, string>? variables)
    {
        if (string.IsNullOrEmpty(template))
            return string.Empty;

        return Regex.Replace(template, @"\{(\w+)\}", match =>
        {
            var key = match.Groups[1].Value;
            if (variables != null)
            {
                var normalizedKey = NormalizeKey(key);
                foreach (var kvp in variables)
                {
                    if (NormalizeKey(kvp.Key) == normalizedKey)
                    {
                        return kvp.Value ?? string.Empty;
                    }
                }
            }
            return string.Empty;
        });
    }

    private async Task<bool> IsPreferenceCancelledAsync(
        Guid? adminUserId, Guid? clientId, Guid? ownerId,
        string channel, string preferenceKey,
        CancellationToken cancellationToken)
    {
        var preference = await _unitOfWork.NotificationPreferences.FirstOrDefaultAsync(
            p => p.AdminUserId == adminUserId
              && p.ClientId == clientId
              && p.OwnerId == ownerId
              && p.Channel == channel
              && p.PreferenceKey == preferenceKey,
            cancellationToken);

        // Absent row = default enabled; row with IsEnabled = false = suppressed
        return preference != null && !preference.IsEnabled;
    }

    private static void EnforceNoSchedulingForInApp(string channel, DateTime? scheduledAt)
    {
        if (channel == "in_app" && scheduledAt.HasValue)
            throw new ConflictException("in_app notifications cannot be scheduled.");
    }

    private static void DetermineStatusAndTimestamps(
        string channel,
        DateTime? scheduledAt,
        bool isCancelled,
        out string status,
        out DateTime? sentAt,
        out DateTime? resolvedScheduledAt)
    {
        if (isCancelled)
        {
            status = "cancelled";
            sentAt = null;
            resolvedScheduledAt = null;
            return;
        }

        if (channel == "in_app")
        {
            status = "delivered";
            sentAt = DateTime.UtcNow;
            resolvedScheduledAt = null;
        }
        else
        {
            status = "pending";
            sentAt = null;
            resolvedScheduledAt = scheduledAt;
        }
    }
}
