namespace RentalPlatform.Business.Interfaces;

public interface IRbacPermissionRegistry
{
    IReadOnlySet<string> AllKeys { get; }
}
