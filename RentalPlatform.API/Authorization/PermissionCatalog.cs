using RentalPlatform.Shared.Enums;

namespace RentalPlatform.API.Authorization;

/// <summary>
/// Single source of truth for admin authorization.
///
/// Each entry maps a policy name (used in [Authorize(Policy = ...)] attributes)
/// to the admin roles it admits. Program.cs registers the ASP.NET authorization
/// policies from this map, and AuthController returns the same names as the
/// effective-permissions list in AuthResponse, which the frontend's
/// usePermissions hook consumes. Changing a role's access here changes both
/// enforcement and the UI in one place — they cannot drift.
/// </summary>
public static class PermissionCatalog
{
    public static readonly IReadOnlyDictionary<string, AdminRole[]> AdminPolicies =
        new Dictionary<string, AdminRole[]>
        {
            // Any admin role — derived from the enum so a future role is never
            // silently locked out of the baseline admin endpoints.
            ["AdminAuthenticated"] = Enum.GetValues<AdminRole>(),
            ["SuperAdminOnly"] = new[]
            {
                AdminRole.SuperAdmin
            },
            ["SalesOrSuperAdmin"] = new[]
            {
                AdminRole.SuperAdmin, AdminRole.Sales
            },
            ["FinanceOrSuperAdmin"] = new[]
            {
                AdminRole.SuperAdmin, AdminRole.Finance
            },
            ["InternalAdminReadOwners"] = new[]
            {
                AdminRole.SuperAdmin, AdminRole.Sales, AdminRole.Finance
            },
            ["InternalAdminRead"] = new[]
            {
                AdminRole.SuperAdmin, AdminRole.Sales, AdminRole.Finance
            },
            // Units inventory reads (list/detail, date blocks, seasonal pricing).
            // Finance is intentionally excluded: it owns money, not inventory, so
            // the Units section and its dashboard widgets stay hidden for Finance.
            ["InternalUnitsRead"] = new[]
            {
                AdminRole.SuperAdmin, AdminRole.Sales, AdminRole.Tech
            },
            // Reporting/analytics reads (booking + finance analytics). Finance
            // keeps these — it needs the financial reports.
            ["InternalAnalyticsRead"] = new[]
            {
                AdminRole.SuperAdmin, AdminRole.Sales, AdminRole.Finance, AdminRole.Tech
            },
        };

    /// <summary>Effective permission names for an admin role, for the auth response.</summary>
    public static IReadOnlyList<string> PermissionsForRole(AdminRole role) =>
        AdminPolicies
            .Where(policy => policy.Value.Contains(role))
            .Select(policy => policy.Key)
            .OrderBy(name => name)
            .ToArray();
}
