using System;

namespace RentalPlatform.Data.Entities;

public class CrmNote
{
    public Guid Id { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? CrmLeadId { get; set; }
    public Guid? CreatedByAdminUserId { get; set; }
    public string NoteText { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigations
    public Booking? Booking { get; set; }
    public CrmLead? CrmLead { get; set; }
    public AdminUser? CreatedByAdminUser { get; set; }
}
