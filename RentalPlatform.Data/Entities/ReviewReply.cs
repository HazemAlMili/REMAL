using System;

namespace RentalPlatform.Data.Entities;

public class ReviewReply
{
    public Guid Id { get; set; }
    public Guid ReviewId { get; set; }
    public Guid OwnerId { get; set; }
    public string ReplyText { get; set; } = null!;
    public bool IsVisible { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigations
    public Review Review { get; set; } = null!;
    public Owner Owner { get; set; } = null!;
}
