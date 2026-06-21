using RentalPlatform.Business.Interfaces;

namespace RentalPlatform.API.Authorization;

public sealed class RbacPermissionRegistry : IRbacPermissionRegistry
{
    public IReadOnlySet<string> AllKeys { get; } =
        PermissionKeys.All.ToHashSet(StringComparer.Ordinal);
}
