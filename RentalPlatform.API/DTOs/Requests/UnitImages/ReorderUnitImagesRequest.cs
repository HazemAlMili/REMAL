using System;
using System.Collections.Generic;

namespace RentalPlatform.API.DTOs.Requests.UnitImages;

public record ReorderUnitImagesRequest
{
    public List<UnitImageOrderItem> Items { get; init; } = new();
}

public record UnitImageOrderItem
{
    public Guid ImageId { get; init; }
    public int DisplayOrder { get; init; }
}
