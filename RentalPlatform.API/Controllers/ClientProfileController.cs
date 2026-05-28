using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.Clients;
using RentalPlatform.API.DTOs.Responses.Clients;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Authorize(Policy = "ClientOnly")]
public class ClientProfileController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientProfileController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpGet("api/client/profile")]
    public async Task<ActionResult<ApiResponse<ClientProfileResponse>>> GetProfile(
        CancellationToken cancellationToken)
    {
        var client = await GetCurrentClientAsync(cancellationToken);

        return Ok(ApiResponse<ClientProfileResponse>.CreateSuccess(MapToResponse(client)));
    }

    [HttpPut("api/client/profile")]
    public async Task<ActionResult<ApiResponse<ClientProfileResponse>>> UpdateProfile(
        [FromBody] UpdateClientProfileRequest request,
        CancellationToken cancellationToken)
    {
        var currentClient = await GetCurrentClientAsync(cancellationToken);
        var updatedClient = await _clientService.UpdateAsync(
            currentClient.Id,
            request.Name,
            request.Phone,
            request.Email,
            currentClient.IsActive,
            cancellationToken);

        return Ok(ApiResponse<ClientProfileResponse>.CreateSuccess(
            MapToResponse(updatedClient),
            "Profile updated successfully."));
    }

    private async Task<Client> GetCurrentClientAsync(CancellationToken cancellationToken)
    {
        var clientId = GetCurrentClientId();
        var client = await _clientService.GetByIdAsync(clientId, cancellationToken);

        if (client == null || !client.IsActive || client.DeletedAt != null)
            throw new NotFoundException("Client profile not found.");

        return client;
    }

    private Guid GetCurrentClientId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var clientId))
            throw new UnauthorizedBusinessException("Current client ID not found in claims.");

        return clientId;
    }

    private static ClientProfileResponse MapToResponse(Client client) => new(
        client.Id,
        client.Name,
        client.Phone,
        client.Email,
        client.IsActive,
        client.CreatedAt,
        client.UpdatedAt
    );
}