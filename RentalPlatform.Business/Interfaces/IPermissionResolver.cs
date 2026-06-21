namespace RentalPlatform.Business.Interfaces;

public interface IPermissionResolver
{
    Task<IReadOnlyCollection<string>> ResolveAsync(
        Guid adminUserId,
        CancellationToken cancellationToken = default);
}
