using System;
using System.Collections.Generic;

namespace RentalPlatform.Data.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Guid UnitId { get; set; }
    public Guid ClientId { get; set; }
    public Guid OwnerId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public string ReviewStatus { get; set; } = null!;
    public DateTime SubmittedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigations
    public Booking Booking { get; set; } = null!;
    public Unit Unit { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public Owner Owner { get; set; } = null!;
    public ICollection<ReviewStatusHistory> StatusHistory { get; set; } = new List<ReviewStatusHistory>();
    public ReviewReply? Reply { get; set; }
}
