# Area Images

This directory contains static images for area cards on the landing page.

## Background

The `GET /api/areas` endpoint returns area data (`id`, `name`, `description`, `isActive`) but does NOT include image URLs. This is a known backend gap for MVP. Area images are stored locally and mapped by area ID.

## File Naming Convention

Area images must be named using the area's UUID from the database:

```
{area.id}.jpg
```

For example, if an area has `id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"`, the image file should be:

```
a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

## Required Files

- `default-area.jpg` - Fallback image used when area-specific image doesn't exist
- `{area-uuid}.jpg` - One image per area (named with the area's UUID)

## Image Specifications

### Area Card Images

- **Format**: JPG (optimized for web)
- **Dimensions**: Minimum 800×600px (4:3 aspect ratio)
- **Aspect Ratio**: 4:3 (matches card `aspect-[4/3]`)
- **Quality**: Medium-high (80%)
- **Subject**: Representative image of the area (coastal view, resort entrance, landmark)
- **Style**: Premium, aspirational, consistent with REMAL brand

### default-area.jpg (Fallback)

- Same specifications as above
- Generic coastal/resort image that works for any area
- Used when area-specific image is missing or fails to load

## Usage

These images are used by:

- `components/public/cards/AreaCard.tsx` - Area cards on landing page
- `components/public/sections/AreasSection.tsx` - Areas section grid

Each card:

- Attempts to load `/images/areas/{area.id}.jpg`
- Falls back to `/images/areas/default-area.jpg` on error
- Uses `next/image` with `fill` + `object-cover`
- `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- Hover effect: image zooms to 110% scale over 700ms

## Adding New Area Images

When a new area is added to the database:

1. Get the area's UUID from the database or API response
2. Prepare an image following the specifications above
3. Name the file `{uuid}.jpg`
4. Place it in this directory
5. The card will automatically use the new image

## Note for Development

Until actual area images are provided:

- Create a `default-area.jpg` placeholder (solid color or generic coastal image)
- All area cards will use this fallback
- Replace with real images when available
- Area-specific images can be added incrementally as they become available
