# Etsy Listing Image Generation Workflow

Complete workflow for generating listing images for TheSunDaisy Bible Story Puppet Printables.

## Templates Available

### 1. `puppet-listing.html` — Characters Only
Shows full character sheet in 1400×2000 format.

**Placeholders:**
- `PRODUCT_IMAGE_URL` — Character sheet PNG
- `TITLE_TEXT` — "Bible Story Puppet Printables"
- `SUBTITLE_TEXT` — Story name (e.g., "Abraham & Isaac")
- `BADGE_LEFT_TEXT` — "12 ELEMENTS + 4 BACKGROUNDS"

**Output:** Portrait listing image with characters on top 3/4, sage green banner with text at bottom.

### 2. `puppet-preview.html` — Characters + 4 Backgrounds
Shows character sheet (top half) + 2×2 grid of 4 background scenes (bottom half).

**Placeholders:**
- `CHARACTERS_IMAGE_URL` — Character sheet PNG
- `BG1_IMAGE_URL` through `BG4_IMAGE_URL` — Background images
- `TITLE_TEXT` — "Bible Story Puppet Printables"
- `SUBTITLE_TEXT` — Story name
- `BADGE_LEFT_TEXT` — "12 ELEMENTS + 4 BACKGROUNDS"

**Output:** Full preview showing what buyer gets (characters + backgrounds).

## Quick Render Workflow

### Single Image Render
```bash
cd /Users/mmcassistant/clawd/skills/etsy-listing-generator

# Characters-only listing
node scripts/render.mjs \
  assets/puppet-listing.html \
  "/absolute/path/to/characters.png" \
  "Bible Story Puppet Printables" \
  "Story Name" \
  "12 ELEMENTS + 4 BACKGROUNDS" \
  "output/story-listing.png"

# Preview with backgrounds (manual HTML edit needed for BG URLs)
# Use template method instead (see below)
```

### Batch Render (Characters Only)
```bash
# Create batch JSON with 26 stories
cat > stories.json << 'EOF'
[
  {
    "file": "file:///path/to/abraham-characters.png",
    "subtitle": "Abraham & Isaac"
  },
  ...
]
EOF

# Render all
node scripts/render.mjs --batch assets/puppet-listing.html stories.json output/
```

### Batch Render with Backgrounds (Node Script)
Use embedded base64 images for Playwright compatibility (see `/tmp/render-preview-listings.mjs` for example).

**Key advantage:** Works in headless Playwright without external HTTP server.

## File Organization

```
/Desktop/Tempest/Bible-Puppet-Printables-Downpour/
├── V_1_Abraham & Isaac/
│   ├── cropped_images/
│   │   ├── characters.jpg
│   │   ├── background-1.jpg through background-4.jpg
│   └── mockups/
│       ├── listing-image.png ← Characters only (from puppet-listing.html)
│       ├── preview-listing.png ← Characters + backgrounds (from puppet-preview.html)
│       ├── characters-cute-mockup.jpg ← Photoshop cute template
│       ├── characters-paper-mockup.jpg ← Photoshop paper template
│       ├── popsicle-mockup.png ← Popsicle stick mockup
│       ├── background-{1-4}-cute-mockup.jpg
│       └── background-{1-4}-paper-mockup.jpg
├── V_2_Adam & Eve/
│   └── ...
└── (26 story folders total)
```

## Downpour Upload

Each folder has 12 mockup images that Downpour recognizes:
- `listing-image.png` — Primary hero image (characters)
- `preview-listing.png` — Full preview (characters + backgrounds)
- Popsicle mockup
- Paper + cute mockups for characters
- Paper + cute mockups for each background

Downpour's template-based mapping system uses identical filenames across all folders.

## Image Optimization Notes

- **Input:** Upscaled images at 3300px longest side (300 DPI for 11" prints)
- **Output:** PNG or JPG as needed
- **Size:** Each listing image ~100-200KB
- **Rendering time:** ~15-50 seconds per image depending on template complexity

## Playwright Headless Rendering

Playwright screenshot rendering works in headless mode without display. Two methods:

### Method 1: HTTP-Served Images
Start HTTP server, use URLs in template. **Limitation:** Headless browser may have network issues.

```bash
cd /path/to/images
python3 -m http.server 8099 &
# Then use http://localhost:8099/filename.png in template
```

### Method 2: Base64 Embedded Images (Recommended)
Convert image to base64, embed as data URL. **Advantage:** No network dependency, reliable in headless.

```javascript
const buf = fs.readFileSync(imagePath);
const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
// Use dataUrl in template HTML
```

## Template Customization

Both templates use:
- Poppins font (imported from Google Fonts)
- Sage green (#4D6840) gradient banner
- Gold (#EDCD5E) pill badges
- 1400×2000px canvas
- White background
- TheSunDaisy branding at bottom

To adjust:
- Banner height: `.banner { height: 280px; }`
- Sage green color: `#4D6840`
- Gold badge color: `#EDCD5E`
- Logo position: `.shop-brand { bottom: 10px; right: 36px; }`

## Future Enhancements

- Add 3rd template: "Bundle preview" (4 stories side-by-side)
- Auto-generate social media variants (Instagram/Pinterest sizes)
- Watermark option
- Multiple background arrangements (3×2 grid, 2×3, etc.)

---

*Last updated: Feb 7, 2026 - Maria*
