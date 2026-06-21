namespace RentalPlatform.Data.Entities;

public class RbacRoleTemplatePermission
{
    public Guid RoleTemplateId { get; set; }
    public string PermissionKey { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public RbacRoleTemplate RoleTemplate { get; set; } = null!;
}
