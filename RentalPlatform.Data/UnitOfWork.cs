using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.Entities;
using RentalPlatform.Data.Repositories;

namespace RentalPlatform.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IRepository<Amenity> Amenities { get; }
    public IRepository<Area> Areas { get; }
    public IRepository<AdminUser> AdminUsers { get; }
    public IRepository<Client> Clients { get; }
    public IRepository<Owner> Owners { get; }
    public IRepository<Unit> Units { get; }
    public IRepository<UnitImage> UnitImages { get; }
    public IRepository<UnitAmenity> UnitAmenities { get; }
    public IRepository<SeasonalPricing> SeasonalPricings { get; }
    public IRepository<DateBlock> DateBlocks { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Amenities = new Repository<Amenity>(_context);
        Areas = new Repository<Area>(_context);
        AdminUsers = new Repository<AdminUser>(_context);
        Clients = new Repository<Client>(_context);
        Owners = new Repository<Owner>(_context);
        Units = new Repository<Unit>(_context);
        UnitImages = new Repository<UnitImage>(_context);
        UnitAmenities = new Repository<UnitAmenity>(_context);
        SeasonalPricings = new Repository<SeasonalPricing>(_context);
        DateBlocks = new Repository<DateBlock>(_context);
    }

    public int SaveChanges()
    {
        return _context.SaveChanges();
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
