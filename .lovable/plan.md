

## Replace Hero Visual with AI-Generated Image

### What
Replace the static SVG dashboard icon on the right side of the hero section with an AI-generated image that visually represents Numor's value proposition — simplified business finance powered by AI.

### Image Concept
Generate a stylized, modern image depicting a clean workspace with a laptop/tablet showing financial dashboards, invoices, and charts — conveying "smart, effortless business finance." The aesthetic will match Numor's dark/modern theme with the brand's primary color accents.

### Steps

1. **Generate the hero image** using the AI image generation skill (`google/gemini-3-pro-image-preview` for higher quality). Prompt will describe a professional, modern finance workspace scene that feels aspirational and relevant to SMB owners.

2. **Save the image** to `public/images/hero-finance.png` so it can be referenced via `staticFile` or a simple import.

3. **Update `src/components/HeroSection.tsx`**:
   - Remove the `DashboardIcon` import
   - Replace the SVG component with an `<img>` tag pointing to the generated image
   - Apply rounded corners, border, and shadow styling consistent with the current card treatment
   - Ensure responsive sizing works on mobile and desktop

### Technical Detail
- Image will be generated at high resolution and placed in `public/images/`
- The `<img>` tag will use `aspect-ratio` and `object-cover` for responsive behavior
- All existing glow/animation effects around the image container will be preserved

