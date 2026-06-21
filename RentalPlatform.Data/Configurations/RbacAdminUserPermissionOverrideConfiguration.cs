using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class RbacAdminUserPermissionOverrideConfiguration
    : IEntityTypeConfiguration<RbacAdminUserPermissionOverride>
{
    public void Configure(EntityTypeBuilder<RbacAdminUserPermissionOverride> builder)
    {
        builder.ToTable("rbac_admin_user_permission_overrides");
        builder.HasKey(x => new { x.AdminUserId, x.PermissionKey })
            .HasName("pk_rbac_admin_user_permission_overrides");

        builder.Property(x => x.AdminUserId)
            .HasColumnName("admin_user_id")
            .IsRequired();
        builder.Property(x => x.PermissionKey)
            .HasColumnName("permission_key")
            .HasMaxLength(50)
            .IsRequired();
        builder.Property(x => x.ModifierType)
            .HasColumnName("modifier_type")
            .HasMaxLength(10)
            .IsRequired();
        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();
        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        builder.HasOne(x => x.AdminUser)
            .WithMany(x => x.PermissionOverrides)
            .HasForeignKey(x => x.AdminUserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_rbac_admin_user_permission_overrides_admin_user_id");
    }
}
