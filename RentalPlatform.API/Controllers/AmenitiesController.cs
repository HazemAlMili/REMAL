using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.Amenities;
using RentalPlatform.API.DTOs.Responses.Amenities;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AmenitiesController : ControllerBase
{
    private readonly IAmenityService _amenityService;

    public AmenitiesController(IAmenityService amenityService)
    {
        _amenityService = amenityService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AmenityResponse>>>> GetAll()
    {
        var amenities = await _amenityService.GetAllAsync();
        var response = amenities.Select(MapToResponse).ToList();
        return Ok(ApiResponse<IReadOnlyList<AmenityResponse>>.CreateSuccess(response));
    }

    [HttpPost]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ApiResponse<AmenityResponse>>> Create(CreateAmenityRequest request)
    {
        var amenity = await _amenityService.CreateAsync(request.Name, request.Icon);
        return Ok(ApiResponse<AmenityResponse>.CreateSuccess(MapToResponse(amenity), "Amenity created successfully."));
    }

    private static AmenityResponse MapToResponse(Amenity amenity)
    {
        return new AmenityResponse(
            amenity.Id,
            amenity.Name,
            amenity.Icon,
            amenity.CreatedAt,
            amenity.UpdatedAt
        );
    }
}
