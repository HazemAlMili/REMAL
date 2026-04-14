using RentalPlatform.Business.Models;

namespace RentalPlatform.Business.Interfaces;

public interface IAuthService
{
    Task<AuthenticatedSubject?> ValidateAdminCredentialsAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<AuthenticatedSubject?> ValidateClientCredentialsAsync(string phone, string password, CancellationToken cancellationToken = default);
    Task<AuthenticatedSubject?> ValidateOwnerCredentialsAsync(string phone, string password, CancellationToken cancellationToken = default);
}
