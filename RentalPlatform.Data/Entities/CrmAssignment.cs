using System;

namespace RentalPlatform.Data.Entities;

public class CrmAssignment
{
    public Guid Id { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? CrmLeadId { get; set; }
    public Guid AssignedAdminUserId { get; set; }
    public bool IsActive { get; set; }
    public DateTime AssignedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigations
    public Booking? Booking { get; set; }
    public CrmLead? CrmLead { get; set; }
    public AdminUser AssignedAdminUser { get; set; } = null!;
}
