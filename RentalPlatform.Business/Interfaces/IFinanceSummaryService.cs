using System;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Models;

namespace RentalPlatform.Business.Interfaces;

public interface IFinanceSummaryService
{
    Task<InvoiceBalanceResult> GetInvoiceBalanceAsync(Guid invoiceId, CancellationToken cancellationToken = default);
    Task<BookingFinanceSnapshotResult> GetBookingFinanceSnapshotAsync(Guid bookingId, CancellationToken cancellationToken = default);
    Task<OwnerPayoutSummaryResult> GetOwnerPayoutSummaryAsync(Guid ownerId, CancellationToken cancellationToken = default);
}
