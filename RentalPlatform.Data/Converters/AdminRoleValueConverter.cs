using System;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using RentalPlatform.Shared.Enums;

namespace RentalPlatform.Data.Converters;

public class AdminRoleValueConverter : ValueConverter<AdminRole, string>
{
    public AdminRoleValueConverter() : base(
        v => ToDbString(v),
        v => ToEnum(v))
    {
    }

    private static string ToDbString(AdminRole role)
    {
        return role switch
        {
            AdminRole.SuperAdmin => "super_admin",
            AdminRole.Sales => "sales",
            AdminRole.Finance => "finance",
            AdminRole.Tech => "tech",
            _ => throw new ArgumentOutOfRangeException(nameof(role), role, null)
        };
    }

    private static AdminRole ToEnum(string value)
    {
        return value switch
        {
            "super_admin" => AdminRole.SuperAdmin,
            "sales" => AdminRole.Sales,
            "finance" => AdminRole.Finance,
            "tech" => AdminRole.Tech,
            _ => throw new ArgumentException($"Unknown admin role value: {value}", nameof(value))
        };
    }
}
