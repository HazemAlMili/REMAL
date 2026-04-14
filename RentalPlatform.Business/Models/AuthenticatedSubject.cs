using RentalPlatform.Shared.Enums;

namespace RentalPlatform.Business.Models;

public class AuthenticatedSubject
{
    public Guid UserId { get; set; }
    public string SubjectType { get; set; } = string.Empty;
    public string? Identifier { get; set; }
    public AdminRole? AdminRole { get; set; }
}
