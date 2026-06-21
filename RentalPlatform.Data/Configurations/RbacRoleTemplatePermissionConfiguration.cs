using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class RbacRoleTemplatePermissionConfiguration
    : IEntityTypeConfiguration<RbacRoleTemplatePermission>
{
    public void Configure(EntityTypeBuilder<RbacRoleTemplatePermission> builder)
    {
        builder.ToTable("rbac_role_template_permissions");
        builder.HasKey(x => new { x.RoleTemplateId, x.PermissionKey })
            .HasName("pk_rbac_role_template_permissions");

        builder.Property(x => x.RoleTemplateId)
            .HasColumnName("role_template_id")
            .IsRequired();
        builder.Property(x => x.PermissionKey)
            .HasColumnName("permission_key")
            .HasMaxLength(50)
            .IsRequired();
        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.HasOne(x => x.RoleTemplate)
            .WithMany(x => x.Permissions)
            .HasForeignKey(x => x.RoleTemplateId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_rbac_role_template_permissions_role_template_id");
    }
}
