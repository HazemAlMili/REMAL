using System;
using RentalPlatform.Shared.Enums;

namespace RentalPlatform.Data.Entities;

public class AdminUser
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public AdminRole? Role { get; set; }
    public Guid RoleTemplateId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public RbacRoleTemplate? RoleTemplate { get; set; }
    public ICollection<RbacAdminUserPermissionOverride> PermissionOverrides { get; set; } =
        new List<RbacAdminUserPermissionOverride>();
}
