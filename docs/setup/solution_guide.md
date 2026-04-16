# Solution Entrypoint Guide

This document defines the canonical solution entrypoint for the RentalPlatform project to ensure consistent builds and developer experience.

## 1. Active Solution

The primary and only active solution for this repository is:
**`RentalPlatform.slnx`**

This uses the modern `.slnx` XML-based solution model supported by .NET 9.0 and 10.0. It contains the following projects:
- `RentalPlatform.API`
- `RentalPlatform.Business`
- `RentalPlatform.Data`
- `RentalPlatform.Shared`

## 2. Build Commands

To build the entire solution from the root directory, always use:
```powershell
dotnet build RentalPlatform.slnx
```

To run the API project locally:
```powershell
dotnet run --project RentalPlatform.API/RentalPlatform.API.csproj
```

## 3. Stale Solution Archival

The legacy `REMAL.sln` file has been moved to `docs/archive/REMAL.sln.stale`. It is no longer supported as it references an obsolete single-project structure (`REMAL.csproj`) that has since been decomposed into the 4-project layout.

> [!CAUTION]
> Do not attempt to use `REMAL.sln` for active development or build reviews, as it will fail due to missing project references.
