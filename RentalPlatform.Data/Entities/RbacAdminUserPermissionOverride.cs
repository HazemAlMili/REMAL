namespace RentalPlatform.Data.Entities;

public class RbacAdminUserPermissionOverride
{
    public Guid AdminUserId { get; set; }
    public string PermissionKey { get; set; } = string.Empty;
    public string ModifierType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public AdminUser AdminUser { get; set; } = null!;
}
