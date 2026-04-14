using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.ToTable("clients");
        builder.HasKey(x => x.Id);
        builder.HasQueryFilter(x => x.DeletedAt == null);
        
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
        builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(30).IsRequired();
        builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(255).IsRequired(false);
        builder.Property(x => x.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
        builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").IsRequired();
        builder.Property(x => x.DeletedAt).HasColumnName("deleted_at").IsRequired(false);

        builder.HasIndex(x => x.Phone).IsUnique().HasDatabaseName("ux_clients_phone");
    }
}
