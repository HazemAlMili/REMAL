using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
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

        var template = await ResolveTemplateAsync(normalizedCode, normalizedChannel, "admin", cancellationToken);

        EnforceNoSchedulingForInApp(normalizedChannel, scheduledAt);

        var isCancelled = await IsPreferenceCancelledAsync(
            adminUserId, null, null, normalizedChannel, normalizedCode, cancellationToken);

        var (renderedSubject, renderedBody) = RenderContent(template, variables);
        DetermineStatusAndTimestamps(normalizedChannel, scheduledAt, isCancelled,
            out var status, out var sentAt, out var resolvedScheduledAt);

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            TemplateId = template.Id,
            AdminUserId = adminUserId,
            ClientId = null,
            OwnerId = null,
            Channel = normalizedChannel,
            NotificationStatus = status,
            Subject = renderedSubject,
            Body = renderedBody,
            ScheduledAt = resolvedScheduledAt,
            SentAt = sentAt,
            ReadAt = null
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

        var template = await ResolveTemplateAsync(normalizedCode, normalizedChannel, "client", cancellationToken);

        EnforceNoSchedulingForInApp(normalizedChannel, scheduledAt);

        var isCancelled = await IsPreferenceCancelledAsync(
            null, clientId, null, normalizedChannel, normalizedCode, cancellationToken);

        var (renderedSubject, renderedBody) = RenderContent(template, variables);
        DetermineStatusAndTimestamps(normalizedChannel, scheduledAt, isCancelled,
            out var status, out var sentAt, out var resolvedScheduledAt);

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            TemplateId = template.Id,
            AdminUserId = null,
            ClientId = clientId,
            OwnerId = null,
            Channel = normalizedChannel,
            NotificationStatus = status,
            Subject = renderedSubject,
            Body = renderedBody,
            ScheduledAt = resolvedScheduledAt,
            SentAt = sentAt,
            ReadAt = null
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

        var template = await ResolveTemplateAsync(normalizedCode, normalizedChannel, "owner", cancellationToken);

        EnforceNoSchedulingForInApp(normalizedChannel, scheduledAt);

        var isCancelled = await IsPreferenceCancelledAsync(
            null, null, ownerId, normalizedChannel, normalizedCode, cancellationToken);

        var (renderedSubject, renderedBody) = RenderContent(template, variables);
        DetermineStatusAndTimestamps(normalizedChannel, scheduledAt, isCancelled,
            out var status, out var sentAt, out var resolvedScheduledAt);

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            TemplateId = template.Id,
            AdminUserId = null,
            ClientId = null,
            OwnerId = ownerId,
            Channel = normalizedChannel,
            NotificationStatus = status,
            Subject = renderedSubject,
            Body = renderedBody,
            ScheduledAt = resolvedScheduledAt,
            SentAt = sentAt,
            ReadAt = null
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

    private async Task<NotificationTemplate> ResolveTemplateAsync(
        string templateCode, string channel, string recipientRole,
        CancellationToken cancellationToken)
    {
        var template = await _unitOfWork.NotificationTemplates.FirstOrDefaultAsync(
            t => t.TemplateCode == templateCode
              && t.Channel == channel
              && t.RecipientRole == recipientRole
              && t.IsActive,
            cancellationToken);

        if (template == null)
            throw new NotFoundException(
                $"No active template found for code '{templateCode}', channel '{channel}', role '{recipientRole}'.");

        return template;
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

    private static (string? renderedSubject, string renderedBody) RenderContent(
        NotificationTemplate template,
        IReadOnlyDictionary<string, string>? variables)
    {
        var renderedBody = Render(template.BodyTemplate, variables, "body");
        var renderedSubject = template.SubjectTemplate != null
            ? Render(template.SubjectTemplate, variables, "subject")
            : null;

        return (renderedSubject, renderedBody);
    }

    private static string Render(
        string template,
        IReadOnlyDictionary<string, string>? variables,
        string fieldName)
    {
        var placeholders = Regex.Matches(template, @"\{\{(\w+)\}\}")
            .Cast<Match>()
            .Select(m => m.Groups[1].Value)
            .Distinct()
            .ToList();

        if (placeholders.Count == 0)
            return template;

        if (variables == null || variables.Count == 0)
            throw new BusinessValidationException(
                $"Template {fieldName} contains placeholders ({string.Join(", ", placeholders.Select(p => $"{{{{{p}}}}}"))}), but no variables were provided.");

        var missing = placeholders.Where(p => !variables.ContainsKey(p)).ToList();
        if (missing.Count > 0)
            throw new BusinessValidationException(
                $"Missing template variables for {fieldName}: {string.Join(", ", missing.Select(p => $"{{{{{p}}}}}"))}.");

        var result = template;
        foreach (var key in placeholders)
            result = result.Replace($"{{{{{key}}}}}", variables[key]);

        return result;
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
