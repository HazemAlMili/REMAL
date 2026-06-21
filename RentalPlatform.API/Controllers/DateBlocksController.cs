using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.DateBlocks;
using RentalPlatform.API.DTOs.Responses.DateBlocks;
using RentalPlatform.API.Models;
using RentalPlatform.API.Authorization;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RentalPlatform.API.Controllers;

[ApiController]
public class DateBlocksController : ControllerBase
{
    private readonly IDateBlockService _dateBlockService;

    public DateBlocksController(IDateBlockService dateBlockService)
    {
        _dateBlockService = dateBlockService;
    }

    // 1. GET /api/internal/units/{unitId}/date-blocks
    [HttpGet("api/internal/units/{unitId}/date-blocks")]
    [Authorize(Policy = PermissionKeys.UnitsRead)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<DateBlockResponse>>>> GetByUnitId(Guid unitId)
    {
        var blocks = await _dateBlockService.GetByUnitIdAsync(unitId);
        var response = blocks.Select(MapToResponse).ToList();
        
        return Ok(ApiResponse<IReadOnlyList<DateBlockResponse>>.CreateSuccess(response));
    }

    // 2. POST /api/internal/units/{unitId}/date-blocks
    [HttpPost("api/internal/units/{unitId}/date-blocks")]
    [Authorize(Policy = PermissionKeys.UnitsManage)]
    public async Task<ActionResult<ApiResponse<DateBlockResponse>>> Create(Guid unitId, CreateDateBlockRequest request)
    {
        var block = await _dateBlockService.CreateAsync(
            unitId,
            request.StartDate,
            request.EndDate,
            request.Reason,
            request.Notes
        );
        
        return Ok(ApiResponse<DateBlockResponse>.CreateSuccess(MapToResponse(block), "Date block created successfully."));
    }

    [HttpPost("api/owner/units/{unitId}/date-blocks")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<ActionResult<ApiResponse<DateBlockResponse>>> CreateOwnerBlock(Guid unitId, CreateDateBlockRequest request)
    {
        var ownerId = GetCurrentOwnerId();
        var block = await _dateBlockService.CreateOwnerBlockAsync(
            ownerId,
            unitId,
            request.StartDate,
            request.EndDate,
            request.Reason,
            request.Notes
        );

        return Ok(ApiResponse<DateBlockResponse>.CreateSuccess(MapToResponse(block), "Date block created successfully."));
    }

    // 3. PUT /api/internal/date-blocks/{id}
    [HttpPut("api/internal/date-blocks/{id}")]
    [Authorize(Policy = PermissionKeys.UnitsManage)]
    public async Task<ActionResult<ApiResponse<DateBlockResponse>>> Update(Guid id, UpdateDateBlockRequest request)
    {
        var block = await _dateBlockService.UpdateAsync(
            id,
            request.StartDate,
            request.EndDate,
            request.Reason,
            request.Notes
        );
        
        return Ok(ApiResponse<DateBlockResponse>.CreateSuccess(MapToResponse(block), "Date block updated successfully."));
    }

    // 4. DELETE /api/internal/date-blocks/{id}
    [HttpDelete("api/internal/date-blocks/{id}")]
    [Authorize(Policy = PermissionKeys.UnitsManage)]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        await _dateBlockService.DeleteAsync(id);
        return Ok(ApiResponse.CreateSuccess(null, "Date block deleted successfully."));
    }

    private static DateBlockResponse MapToResponse(DateBlock block)
    {
        return new DateBlockResponse
        {
            Id = block.Id,
            UnitId = block.UnitId,
            StartDate = block.StartDate,
            EndDate = block.EndDate,
            Reason = block.Reason,
            Notes = block.Notes,
            CreatedAt = block.CreatedAt,
            UpdatedAt = block.UpdatedAt
        };
    }

    private Guid GetCurrentOwnerId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(subClaim) || !Guid.TryParse(subClaim, out var ownerId))
        {
            throw new UnauthorizedAccessException("Current owner ID not found in claims.");
        }

        return ownerId;
    }
}
