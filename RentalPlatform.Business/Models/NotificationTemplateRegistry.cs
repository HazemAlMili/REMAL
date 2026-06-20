using System;
using System.Collections.Generic;

namespace RentalPlatform.Business.Models;

public class NotificationTemplateDefinition
{
    public string DefaultTitle { get; set; } = string.Empty;
    public string DefaultBody { get; set; } = string.Empty;
    public string[] AllowedChannels { get; set; } = Array.Empty<string>();
}

public static class NotificationTemplateRegistry
{
    private static readonly Dictionary<string, NotificationTemplateDefinition> Templates = new(StringComparer.OrdinalIgnoreCase)
    {
        {
            "OWNER_NEW_BOOKING", new NotificationTemplateDefinition
            {
                DefaultTitle = "حجز جديد للوحدة: {unitName}",
                DefaultBody = "مرحباً {ownerName}، تم تسجيل حجز جديد برقم {bookingId} من تاريخ {checkInDate} إلى {checkOutDate}.",
                AllowedChannels = new[] { "Email", "InApp" }
            }
        },
        {
            "CLIENT_BOOKING_CONFIRMED", new NotificationTemplateDefinition
            {
                DefaultTitle = "تم تأكيد حجزك بنجاح!",
                DefaultBody = "عزيزنا العميل، تم تأكيد حجزك للوحدة بنجاح. المبلغ الإجمالي: {finalAmount}.",
                AllowedChannels = new[] { "Email", "InApp" }
            }
        },
        {
            "WELCOME_ADMIN", new NotificationTemplateDefinition
            {
                DefaultTitle = "Welcome",
                DefaultBody = "Welcome back, {adminName}!",
                AllowedChannels = new[] { "InApp" }
            }
        },
        {
            "BOOKING_COMPLETED_WITH_BALANCE", new NotificationTemplateDefinition
            {
                DefaultTitle = "Booking completed with outstanding balance",
                DefaultBody = "Booking {bookingShortId} for {clientName} in {unitName} was auto-completed after checkout on {checkOutDate}. Outstanding balance: {outstandingAmount} EGP.",
                AllowedChannels = new[] { "InApp" }
            }
        }
    };

    public static NotificationTemplateDefinition Get(string templateCode)
    {
        if (!Templates.TryGetValue(templateCode, out var template))
            throw new KeyNotFoundException($"Notification template code '{templateCode}' is not registered in the application provider.");
        return template;
    }
}
