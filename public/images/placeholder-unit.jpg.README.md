# Placeholder Unit Image

## Required File

- `placeholder-unit.jpg` - Fallback image for units without uploaded images

## Specifications

- **Format**: JPG
- **Dimensions**: 800×600px (4:3 aspect ratio)
- **Subject**: Generic luxury property or coastal view
- **Style**: Neutral, professional, matches REMAL brand aesthetic

## Usage

This placeholder is used by:

- `lib/utils/image.ts` - `getImageUrl()` and `getCoverImageUrl()` functions
- `components/public/cards/UnitCard.tsx` - When unit has no images
- Any component displaying unit images

## Note

Until a proper placeholder image is created, the application will show a broken image icon for units without uploaded images. Create a simple placeholder (solid color with "No Image Available" text, or a generic property photo) to improve the user experience during development.
