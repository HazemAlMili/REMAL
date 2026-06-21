using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;
using RentalPlatform.Data;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace RentalPlatform.Business.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPermissionResolver _permissionResolver;

    public AuthService(IUnitOfWork unitOfWork, IPermissionResolver permissionResolver)
    {
        _unitOfWork = unitOfWork;
        _permissionResolver = permissionResolver;
    }

    public async Task<AuthenticatedSubject?> ValidateAdminCredentialsAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var emailLower = email.ToLowerInvariant();
        var admin = await _unitOfWork.AdminUsers.Query()
            .AsNoTracking()
            .Include(a => a.RoleTemplate)
            .SingleOrDefaultAsync(
                a => a.Email.ToLower() == emailLower && a.IsActive,
                cancellationToken);
        
        if (admin == null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(password, admin.PasswordHash))
            return null;

        var permissions = await _permissionResolver.ResolveAsync(admin.Id, cancellationToken);

        return new AuthenticatedSubject
        {
            UserId = admin.Id,
            SubjectType = "Admin",
            Identifier = admin.Email,
            Name = admin.Name,
            AdminRole = admin.Role,
            AdminRoleName = admin.RoleTemplate?.Name,
            AdminPermissions = permissions,
            AdminUpdatedAt = admin.UpdatedAt
        };
    }

    public async Task<AuthenticatedSubject?> ValidateClientCredentialsAsync(string phone, string password, CancellationToken cancellationToken = default)
    {
        var normalizedPhone = phone.Trim().TrimStart('+');
        var client = await _unitOfWork.Clients.FirstOrDefaultAsync(
            c => c.Phone.Replace("+", string.Empty) == normalizedPhone && c.IsActive,
            cancellationToken);
        
        if (client == null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(password, client.PasswordHash))
            return null;

        return new AuthenticatedSubject
        {
            UserId = client.Id,
            SubjectType = "Client",
            Identifier = client.Phone,
            Name = client.Name,
            AdminRole = null,
            ClientUpdatedAt = client.UpdatedAt
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
            Name = owner.Name,
            AdminRole = null
        };
    }
}
