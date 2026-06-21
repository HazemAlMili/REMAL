using RentalPlatform.Shared.Enums;

namespace RentalPlatform.Business.Models;

public class AuthenticatedSubject
{
    public Guid UserId { get; set; }
    public string SubjectType { get; set; } = string.Empty;
    public string? Identifier { get; set; }
    public string? Name { get; set; }
    public AdminRole? AdminRole { get; set; }
    public string? AdminRoleName { get; set; }
    public IReadOnlyCollection<string> AdminPermissions { get; set; } = Array.Empty<string>();
    public DateTime? AdminUpdatedAt { get; set; }
    public DateTime? ClientUpdatedAt { get; set; }
}
