# Brand Colors Setup Instructions

This project uses a simple color system that allows you to quickly customize the branding for different real estate agencies. All color changes are managed in a single file.

## How to Change Brand Colors

1. Open the file: `src/config/brand-colors.ts`
2. You'll see three color values:
   - `dark`: The primary dark color of the brand (required)
   - `light`: The primary light color of the brand (required)
   - `highlight`: An accent color (optional)

## Example Setups

### For a Two-Color Brand (e.g., Black & White):
```typescript
export const brandColors: BrandColors = {
  dark: '#000000',    // Black
  light: '#FFFFFF',   // White
  // highlight: '#FF0000'    // Leave commented out for two-color brands
}
```

### For a Three-Color Brand:
```typescript
export const brandColors: BrandColors = {
  dark: '#003366',    // Dark Blue
  light: '#FFFFFF',   // White
  highlight: '#FFD700' // Gold
}
```

## Color Formats
You can use any of these color formats:
- HEX colors: `#RRGGBB` (e.g., '#FF0000' for red)
- RGB: `rgb(R, G, B)` (e.g., 'rgb(255, 0, 0)' for red)
- RGBA if transparency needed: `rgba(R, G, B, A)` (e.g., 'rgba(255, 0, 0, 0.5)' for semi-transparent red)

## Important Notes
- Always keep the `dark` and `light` colors
- The `highlight` color is optional - leave it commented out if not needed
- Colors will automatically update throughout the site when you change these values
- If no highlight color is set, the system will use the dark color as a fallback 