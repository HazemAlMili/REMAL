using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Amenity> Amenities { get; set; } = null!;
    public DbSet<Area> Areas { get; set; } = null!;
    public DbSet<AdminUser> AdminUsers { get; set; } = null!;
    public DbSet<Client> Clients { get; set; } = null!;
    public DbSet<Owner> Owners { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override int SaveChanges()
    {
        ApplyTimestampsAndSoftDelete();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyTimestampsAndSoftDelete();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyTimestampsAndSoftDelete()
    {
        var entries = ChangeTracker.Entries();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                var createdAtProp = entry.Property("CreatedAt");
                if (createdAtProp != null)
                {
                    createdAtProp.CurrentValue = DateTime.UtcNow;
                }
                
                var updatedAtProp = entry.Property("UpdatedAt");
                if (updatedAtProp != null)
                {
                    updatedAtProp.CurrentValue = DateTime.UtcNow;
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                var updatedAtProp = entry.Property("UpdatedAt");
                if (updatedAtProp != null && entry.Property("UpdatedAt").IsModified == false)
                {
                    updatedAtProp.CurrentValue = DateTime.UtcNow;
                }
            }
            else if (entry.State == EntityState.Deleted)
            {
                if (entry.Entity is Client || entry.Entity is Owner)
                {
                    entry.State = EntityState.Modified;
                    
                    var deletedAtProp = entry.Property("DeletedAt");
                    if (deletedAtProp != null)
                    {
                        deletedAtProp.CurrentValue = DateTime.UtcNow;
                    }

                    var updatedAtProp = entry.Property("UpdatedAt");
                    if (updatedAtProp != null)
                    {
                        updatedAtProp.CurrentValue = DateTime.UtcNow;
                    }
                }
            }
        }
    }
}
