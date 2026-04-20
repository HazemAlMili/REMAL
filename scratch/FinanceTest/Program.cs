using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;
using RentalPlatform.Data.Repositories;

// Wire DI container just like the real app does
var services = new ServiceCollection();
services.AddDbContext<AppDbContext>(opt =>
    opt.UseInMemoryDatabase("UoWTest"));
services.AddScoped<IUnitOfWork, UnitOfWork>();
var provider = services.BuildServiceProvider();

Console.WriteLine("--- IUnitOfWork Resolution Test ---");
using var scope = provider.CreateScope();
var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
Console.WriteLine("IUnitOfWork resolved successfully.");

Console.WriteLine("\n--- Repository Exposure Check ---");
Console.WriteLine($"Payments:     {(uow.Payments     != null ? "OK" : "MISSING")}");
Console.WriteLine($"Invoices:     {(uow.Invoices     != null ? "OK" : "MISSING")}");
Console.WriteLine($"InvoiceItems: {(uow.InvoiceItems  != null ? "OK" : "MISSING")}");
Console.WriteLine($"OwnerPayouts: {(uow.OwnerPayouts  != null ? "OK" : "MISSING")}");

if (uow.Payments == null || uow.Invoices == null || uow.InvoiceItems == null || uow.OwnerPayouts == null)
{
    Console.WriteLine("One or more Finance repositories are missing.");
    Environment.Exit(1);
}

Console.WriteLine("\n--- Repository AddAsync + SaveChangesAsync Test ---");
var payment = new Payment
{
    BookingId = Guid.NewGuid(),
    PaymentStatus = "pending",
    PaymentMethod = "cash",
    Amount = 500.00m
};

await uow.Payments.AddAsync(payment);
await uow.SaveChangesAsync();
Console.WriteLine($"Payment persisted via UoW. ID: {payment.Id}");

Console.WriteLine("\n--- Repository Query Test ---");
var found = await uow.Payments.FirstOrDefaultAsync(p => p.Id == payment.Id);
if (found == null)
{
    Console.WriteLine("Payment not found via repository query.");
    Environment.Exit(1);
}
Console.WriteLine($"Payment queried via UoW. Status: {found.PaymentStatus}");

Console.WriteLine("\n--- Existing Repositories Intact Check ---");
Console.WriteLine($"Bookings:    {(uow.Bookings    != null ? "OK" : "MISSING")}");
Console.WriteLine($"CrmLeads:    {(uow.CrmLeads    != null ? "OK" : "MISSING")}");
Console.WriteLine($"Units:       {(uow.Units       != null ? "OK" : "MISSING")}");

Console.WriteLine("\nVerification Complete: SUCCESS");
