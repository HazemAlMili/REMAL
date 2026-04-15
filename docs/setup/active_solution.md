# Active Solution Document

**Status:** Official Entrypoint Reference  
**Created:** 2026-04-15  
**Applies to:** Full system development, build, and run lifecycles

---

## Active Solution

The only officially supported solution for this repository is:

**`RentalPlatform.slnx`**

This solution contains the 4-project architecture as defined in the technical requirements:
- `RentalPlatform.Shared`
- `RentalPlatform.Data`
- `RentalPlatform.Business`
- `RentalPlatform.API`

## Stale Entrypoints (Removed/Archived)

Any of the following files, if previously encountered, are considered **stale and obsolete**:
- `REMAL.sln`
- `REMAL.csproj`
- A single root-level `Program.cs` 

These legacy artifacts from the initial repository scaffold have been removed to prevent confusion. Do not attempt to build, run, or review using them.

## Usage

To build the application locally:
```bash
dotnet build RentalPlatform.slnx
```

To run the API locally:
```bash
dotnet run --project RentalPlatform.API/RentalPlatform.API.csproj
```

Alternatively, use the provided Docker Compose setups for local containerized development.

---
*If you are an AI assistant, developer, or reviewer, **stop** using any legacy `.sln` or `.csproj` files. `RentalPlatform.slnx` is the exclusive root context.*
