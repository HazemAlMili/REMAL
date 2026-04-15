using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;
using RentalPlatform.Data.Repositories;

namespace RentalPlatform.Data;

public interface IUnitOfWork
{
    IRepository<Amenity> Amenities { get; }
    IRepository<Area> Areas { get; }
    IRepository<AdminUser> AdminUsers { get; }
    IRepository<Client> Clients { get; }
    IRepository<Owner> Owners { get; }

    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
