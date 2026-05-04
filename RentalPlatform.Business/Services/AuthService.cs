using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;
using RentalPlatform.Data;
using BCrypt.Net;

namespace RentalPlatform.Business.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthenticatedSubject?> ValidateAdminCredentialsAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var emailLower = email.ToLowerInvariant();
        var admin = await _unitOfWork.AdminUsers.FirstOrDefaultAsync(a => a.Email.ToLower() == emailLower && a.IsActive, cancellationToken);
        
        if (admin == null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(password, admin.PasswordHash))
            return null;

        return new AuthenticatedSubject
        {
            UserId = admin.Id,
            SubjectType = "Admin",
            Identifier = admin.Email,
            AdminRole = admin.Role
        };
    }

    public async Task<AuthenticatedSubject?> ValidateClientCredentialsAsync(string phone, string password, CancellationToken cancellationToken = default)
    {
        var client = await _unitOfWork.Clients.FirstOrDefaultAsync(c => c.Phone == phone && c.IsActive, cancellationToken);
        
        if (client == null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(password, client.PasswordHash))
            return null;

        return new AuthenticatedSubject
        {
            UserId = client.Id,
            SubjectType = "Client",
            Identifier = client.Phone,
            AdminRole = null
        };
    }

    public async Task<AuthenticatedSubject?> ValidateOwnerCredentialsAsync(string phone, string password, CancellationToken cancellationToken = default)
    {
        // DeletedAt behavior is already handled by repository QueryFilters (DeletedAt == null)
        var owner = await _unitOfWork.Owners.FirstOrDefaultAsync(o => o.Phone == phone && o.Status == "active", cancellationToken);
        
        if (owner == null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(password, owner.PasswordHash))
            return null;

        return new AuthenticatedSubject
        {
            UserId = owner.Id,
            SubjectType = "Owner",
            Identifier = owner.Phone,
            AdminRole = null
        };
    }
}
