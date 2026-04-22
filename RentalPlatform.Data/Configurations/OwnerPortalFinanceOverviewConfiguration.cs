using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Data.Configurations;

/// <summary>
/// Fluent API configuration for OwnerPortalFinanceOverview.
/// Maps to the owner_portal_finance_overview SQL view.
/// Keyless and read-only — no table, no key, no write path.
/// Column names match the frozen DB view contract exactly (DB-OP-04).
/// </summary>
public sealed class OwnerPortalFinanceOverviewConfiguration
    : IEntityTypeConfiguration<OwnerPortalFinanceOverview>
{
    public void Configure(EntityTypeBuilder<OwnerPortalFinanceOverview> builder)
    {
        builder.ToView("owner_portal_finance_overview");
        builder.HasNoKey();

        builder.Property(x => x.OwnerId).HasColumnName("owner_id").IsRequired();
        builder.Property(x => x.BookingId).HasColumnName("booking_id").IsRequired();
        builder.Property(x => x.UnitId).HasColumnName("unit_id").IsRequired();
        builder.Property(x => x.InvoiceId).HasColumnName("invoice_id");
        builder.Property(x => x.InvoiceStatus).HasColumnName("invoice_status").HasMaxLength(50);
        builder.Property(x => x.InvoicedAmount).HasColumnName("invoiced_amount").HasColumnType("decimal(12,2)").IsRequired();
        builder.Property(x => x.PaidAmount).HasColumnName("paid_amount").HasColumnType("decimal(12,2)").IsRequired();
        builder.Property(x => x.RemainingAmount).HasColumnName("remaining_amount").HasColumnType("decimal(12,2)").IsRequired();
        builder.Property(x => x.PayoutId).HasColumnName("payout_id");
        builder.Property(x => x.PayoutStatus).HasColumnName("payout_status").HasMaxLength(50);
        builder.Property(x => x.PayoutAmount).HasColumnName("payout_amount").HasColumnType("decimal(12,2)");
        builder.Property(x => x.PayoutScheduledAt).HasColumnName("payout_scheduled_at");
        builder.Property(x => x.PayoutPaidAt).HasColumnName("payout_paid_at");
    }
}
