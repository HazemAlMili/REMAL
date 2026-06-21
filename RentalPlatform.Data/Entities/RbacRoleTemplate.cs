namespace RentalPlatform.Data.Entities;

public class RbacRoleTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystem { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<RbacRoleTemplatePermission> Permissions { get; set; } =
        new List<RbacRoleTemplatePermission>();
    public ICollection<AdminUser> AdminUsers { get; set; } = new List<AdminUser>();
}
