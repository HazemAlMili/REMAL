using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Business.Services;

public class PaymentService : IPaymentService
{
    private readonly IUnitOfWork _unitOfWork;

    private static readonly string[] AllowedPaymentMethods = { "cash", "bank_transfer", "card", "wallet" };

    public PaymentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<Payment>> GetAllAsync(
        string? paymentStatus = null,
        Guid? bookingId = null,
        Guid? invoiceId = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Payment> query = _unitOfWork.Payments.Query()
            .Include(p => p.Booking)
                .ThenInclude(b => b.Client);

        if (!string.IsNullOrWhiteSpace(paymentStatus))
            query = query.Where(p => p.PaymentStatus == paymentStatus.Trim().ToLower());

        if (bookingId.HasValue)
            query = query.Where(p => p.BookingId == bookingId.Value);

        if (invoiceId.HasValue)
            query = query.Where(p => p.InvoiceId == invoiceId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            var phoneSearch = NormalizePhoneSearch(search);

            query = query.Where(p =>
                p.BookingId.ToString().ToLower().Contains(normalizedSearch) ||
                (p.InvoiceId.HasValue && p.InvoiceId.Value.ToString().ToLower().Contains(normalizedSearch)) ||
                (p.ReferenceNumber != null && p.ReferenceNumber.ToLower().Contains(normalizedSearch)) ||
                p.Booking.Client.Name.ToLower().Contains(normalizedSearch) ||
                p.Booking.Client.Phone.ToLower().Contains(normalizedSearch) ||
                (
                    phoneSearch != string.Empty &&
                    p.Booking.Client.Phone
                        .Replace("+", "")
                        .Replace(" ", "")
                        .Replace("-", "")
                        .Replace("(", "")
                        .Replace(")", "")
                        .Contains(phoneSearch)
                ));
        }

        return await query.OrderByDescending(p => p.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<Payment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Payments.Query()
            .Include(p => p.Booking)
                .ThenInclude(b => b.Client)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Payment> CreateAsync(
        Guid bookingId,
        Guid? invoiceId,
        string paymentMethod,
        decimal amount,
        string? referenceNumber,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var bookingExists = await _unitOfWork.Bookings.ExistsAsync(b => b.Id == bookingId, cancellationToken);
        if (!bookingExists)
            throw new NotFoundException($"Booking with ID {bookingId} not found");

        if (invoiceId.HasValue)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(invoiceId.Value, cancellationToken);
            if (invoice == null)
                throw new NotFoundException($"Invoice with ID {invoiceId.Value} not found");

            if (invoice.BookingId != bookingId)
                throw new ConflictException(
                    $"Invoice {invoiceId.Value} does not belong to booking {bookingId}");
        }

        var normalizedMethod = paymentMethod.Trim().ToLower();
        if (!AllowedPaymentMethods.Contains(normalizedMethod))
            throw new BusinessValidationException(
                $"Invalid payment method '{paymentMethod}'. Allowed: {string.Join(", ", AllowedPaymentMethods)}");

        if (amount <= 0)
            throw new BusinessValidationException("Payment amount must be greater than zero");

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            BookingId = bookingId,
            InvoiceId = invoiceId,
            PaymentStatus = "pending",
            PaymentMethod = normalizedMethod,
            Amount = amount,
            ReferenceNumber = referenceNumber?.Trim(),
            Notes = notes?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Payments.AddAsync(payment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return payment;
    }

    public async Task<Payment> MarkPaidAsync(
        Guid id,
        string? referenceNumber,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var payment = await GetPaymentOrThrowAsync(id, cancellationToken);

        if (payment.PaymentStatus != "pending")
            throw new ConflictException(
                $"Payment {id} cannot be marked as paid: current status is '{payment.PaymentStatus}'. Only pending payments can be marked as paid.");

        // Auto-link to booking's active invoice if not already linked
        if (!payment.InvoiceId.HasValue)
        {
            var activeInvoice = await _unitOfWork.Invoices.Query()
                .Where(i => i.BookingId == payment.BookingId 
                    && i.InvoiceStatus != "cancelled" 
                    && i.InvoiceStatus != "superseded")
                .FirstOrDefaultAsync(cancellationToken);

            if (activeInvoice != null)
            {
                payment.InvoiceId = activeInvoice.Id;
            }
        }

        Invoice? linkedInvoice = null;
        if (payment.InvoiceId.HasValue)
        {
            linkedInvoice = await _unitOfWork.Invoices.GetByIdAsync(payment.InvoiceId.Value, cancellationToken);
            if (linkedInvoice == null)
                throw new NotFoundException($"Linked invoice {payment.InvoiceId.Value} not found");

            if (linkedInvoice.InvoiceStatus is "cancelled" or "superseded")
                throw new ConflictException(
                    $"Payment {id} cannot be marked as paid: linked invoice {linkedInvoice.Id} is {linkedInvoice.InvoiceStatus}.");

            // Allow payments to be marked as paid even if invoice is in draft status
            // This supports the workflow where payments are received before invoice is issued
        }

        // Check for overpayment - calculate total paid amount for this booking
        // IMPORTANT: Exclude the current payment to avoid double-counting if this is a retry
        var currentPaidTotal = await _unitOfWork.Payments.Query()
            .Where(p => p.BookingId == payment.BookingId 
                && p.PaymentStatus == "paid" 
                && p.Id != id)
            .SumAsync(p => p.Amount, cancellationToken);

        var projectedPaidTotal = currentPaidTotal + payment.Amount;

        // Get the active invoice total for this booking
        var bookingInvoice = await _unitOfWork.Invoices.Query()
            .Where(i => i.BookingId == payment.BookingId 
                && i.InvoiceStatus != "cancelled" 
                && i.InvoiceStatus != "superseded")
            .FirstOrDefaultAsync(cancellationToken);

        if (bookingInvoice != null && projectedPaidTotal > bookingInvoice.TotalAmount)
        {
            var overpaymentAmount = projectedPaidTotal - bookingInvoice.TotalAmount;
            throw new ConflictException(
                $"Payment {id} cannot be marked as paid: this would result in an overpayment of {overpaymentAmount:F2}. " +
                $"Invoice total: {bookingInvoice.TotalAmount:F2}, Current paid: {currentPaidTotal:F2}, This payment: {payment.Amount:F2}. " +
                $"Overpayments are not allowed.");
        }

        payment.PaymentStatus = "paid";
        payment.PaidAt = DateTime.UtcNow;

        if (referenceNumber != null)
            payment.ReferenceNumber = referenceNumber.Trim();

        if (notes != null)
            payment.Notes = notes.Trim();

        payment.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Payments.Update(payment);

        // Sync invoice status when fully covered or overpaid
        if (linkedInvoice != null)
        {
            var invoicePaidTotal = await _unitOfWork.Payments.Query()
                .Where(p => p.InvoiceId == linkedInvoice.Id
                         && p.PaymentStatus == "paid"
                         && p.Id != id)
                .SumAsync(p => p.Amount, cancellationToken);
            invoicePaidTotal += payment.Amount;

            // Mark invoice as paid when total paid amount >= invoice total
            if (invoicePaidTotal >= linkedInvoice.TotalAmount && linkedInvoice.InvoiceStatus != "paid")
            {
                linkedInvoice.InvoiceStatus = "paid";
                linkedInvoice.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Invoices.Update(linkedInvoice);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return payment;
    }

    public async Task<Payment> MarkFailedAsync(
        Guid id,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var payment = await GetPaymentOrThrowAsync(id, cancellationToken);

        if (payment.PaymentStatus != "pending")
            throw new ConflictException(
                $"Payment {id} cannot be marked as failed: current status is '{payment.PaymentStatus}'. Only pending payments can be marked as failed.");

        payment.PaymentStatus = "failed";

        if (notes != null)
            payment.Notes = notes.Trim();

        payment.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Payments.Update(payment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return payment;
    }

    public async Task<Payment> CancelAsync(
        Guid id,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var payment = await GetPaymentOrThrowAsync(id, cancellationToken);

        if (payment.PaymentStatus != "pending")
            throw new ConflictException(
                $"Payment {id} cannot be cancelled: current status is '{payment.PaymentStatus}'. Only pending payments can be cancelled.");

        payment.PaymentStatus = "cancelled";

        if (notes != null)
            payment.Notes = notes.Trim();

        payment.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Payments.Update(payment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return payment;
    }

    // ---------------------------------------------------------------
    //  Private helpers
    // ---------------------------------------------------------------

    private async Task<Payment> GetPaymentOrThrowAsync(Guid id, CancellationToken cancellationToken)
    {
        var payment = await _unitOfWork.Payments.GetByIdAsync(id, cancellationToken);
        if (payment == null)
            throw new NotFoundException($"Payment with ID {id} not found");
        return payment;
    }

    private static string NormalizePhoneSearch(string value)
    {
        return new string(value.Where(char.IsDigit).ToArray());
    }

    public async Task<int> LinkPaidPaymentsToInvoicesAsync(CancellationToken cancellationToken = default)
    {
        // Find all paid payments that have no invoice_id
        var orphanedPaidPayments = await _unitOfWork.Payments.Query()
            .Where(p => p.PaymentStatus == "paid" && p.InvoiceId == null)
            .ToListAsync(cancellationToken);

        int linkedCount = 0;

        foreach (var payment in orphanedPaidPayments)
        {
            // Find the active (non-cancelled) invoice for this booking
            var activeInvoice = await _unitOfWork.Invoices.Query()
                .Where(i => i.BookingId == payment.BookingId
                    && i.InvoiceStatus != "cancelled"
                    && i.InvoiceStatus != "superseded")
                .FirstOrDefaultAsync(cancellationToken);

            if (activeInvoice != null)
            {
                payment.InvoiceId = activeInvoice.Id;
                payment.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Payments.Update(payment);
                linkedCount++;
            }
        }

        if (linkedCount > 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return linkedCount;
    }
}
