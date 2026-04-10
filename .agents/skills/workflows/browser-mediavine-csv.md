# Workflow: Mediavine CSV Export Download

**Purpose:** Download earnings CSV from Mediavine dashboard
**Time saved:** 10 min → 1 min
**Last verified:** Jan 30, 2026

## Prerequisites
- Logged into Mediavine dashboard (clawd browser profile)
- Site ID for the target site

## Site IDs
| Site | Site ID |
|------|---------|
| Hello Hayley | 16496 |
| We Heart This | 6352 |
| Living Tickled | 7815 |
| Moms Make Cents | 6353 |
| Today Mommy | 4159 |

## Steps

1. **Navigate to the site dashboard**
```
browser open profile=clawd targetUrl=https://reporting.mediavine.com/sites/<site_id>/dashboard
```

2. **Wait for page load** (3-5 seconds)

3. **Find the download button**
   - Location: "Earnings & RPM" section (NOT "Earnings Summary" at top)
   - Top-right corner of section header
   - Two icons: 🔗 (link) and ⬇️ (download)
   - Click the DOWNLOAD ARROW (⬇️)

4. **Click download**
```
browser act request.kind=click request.ref=<download_button_ref>
```

## Gotchas

⚠️ **Wrong section!**
- "Earnings Summary" at top does NOT have CSV export
- Look for "Earnings & RPM" section below it

⚠️ **Two similar icons**
- Link icon (🔗) ≠ Download icon (⬇️)
- Click the download arrow, not the link

⚠️ **Popup handling**
- First download usually works
- Subsequent downloads in same session may need delays or popup handling

## Screenshot Reference
`/projects/analytics-dashboard/docs/mediavine-download-location.png`

## Note
Melrose Family is on RAPTIVE, not Mediavine! Use Raptive dashboard for that site.

## Related
- TOOLS.md → "Mediavine CSV Download - LESSON LEARNED"
- `raptive-excel-export.md` (TODO)
