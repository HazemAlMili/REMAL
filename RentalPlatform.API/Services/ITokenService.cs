using RentalPlatform.Business.Models;
using System.Security.Claims;

namespace RentalPlatform.API.Services;

public interface ITokenService
{
    string GenerateAccessToken(AuthenticatedSubject subject);
    string GenerateRefreshToken(AuthenticatedSubject subject);
    ClaimsPrincipal? GetPrincipalFromToken(string token, bool validateLifetime = true);
}
