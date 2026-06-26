# Project Images

This directory contains static images for project cards on the landing page.

## Background

The `GET /api/projects` endpoint returns project data (`id`, `name`, `description`, `isActive`) but does NOT include image URLs. This is a known backend gap for MVP. Project images are stored locally and mapped by project ID.

## File Naming Convention

Project images must be named using the project's UUID from the database:

```
{project.id}.jpg
```

For example, if a project has `id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"`, the image file should be:

```
a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

## Required Files

- `default-project.jpg` - Fallback image used when project-specific image doesn't exist
- `{project-uuid}.jpg` - One image per project (named with the project's UUID)

## Image Specifications

### Project Card Images

- **Format**: JPG (optimized for web)
- **Dimensions**: Minimum 800×600px (4:3 aspect ratio)
- **Aspect Ratio**: 4:3 (matches card `aspect-[4/3]`)
- **Quality**: Medium-high (80%)
- **Subject**: Representative image of the project (coastal view, resort entrance, landmark)
- **Style**: Premium, aspirational, consistent with Kaza Booking brand

### default-project.jpg (Fallback)

- Same specifications as above
- Generic coastal/resort image that works for any project
- Used when project-specific image is missing or fails to load

## Usage

These images are used by:

- `components/public/cards/ProjectCard.tsx` - Project cards on landing page
- `components/public/sections/ProjectsSection.tsx` - Projects section grid

Each card:

- Attempts to load `/images/projects/{project.id}.jpg`
- Falls back to `/images/projects/default-project.jpg` on error
- Uses `next/image` with `fill` + `object-cover`
- `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- Hover effect: image zooms to 110% scale over 700ms

## Adding New Project Images

When a new project is added to the database:

1. Get the project's UUID from the database or API response
2. Prepare an image following the specifications above
3. Name the file `{uuid}.jpg`
4. Place it in this directory
5. The card will automatically use the new image

## Note for Development

Until actual project images are provided:

- Create a `default-project.jpg` placeholder (solid color or generic coastal image)
- All project cards will use this fallback
- Replace with real images when available
- Project-specific images can be added incrementally as they become available
