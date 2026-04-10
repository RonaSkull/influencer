# GenSpark AI Drive Download Workflow

*Last updated: 2026-01-31 by Maria*

## Overview

After generating videos in GenSpark, files are stored in **AI Drive**. This document covers how to navigate and download them.

---

## 🚀 BEST METHOD: Ask GenSpark Directly!

**The easiest way to bulk download is to ASK GENSPARK:**

1. Go to https://www.genspark.ai
2. In the main chat, type:
   ```
   How can I bulk download all files from a folder in AI Drive? 
   I have [X] files in a folder called '[FOLDER NAME]' and I want 
   to download them all at once instead of one by one.
   ```
3. GenSpark will:
   - List the folder contents
   - Try to compress into ZIP (may or may not work)
   - Generate **direct download URLs** with auth tokens for each file

4. Copy the URLs and use a download manager or curl to batch download

**Example GenSpark response provides:**
- Method 1: Download Manager (JDownloader, Free Download Manager, etc.)
- All download links in a code block

**Download URL format:**
```
https://www.genspark.ai/api/files/s/{FILE_ID}?token={AUTH_TOKEN}
```

---

## Accessing Generated Videos

### Step 1: Navigate to AI Drive

1. Go to **https://www.genspark.ai**
2. Click **AI Drive** in the left sidebar
3. You'll see:
   - **Recent Files** - thumbnails of recently generated content
   - **Folders** - organized by project (e.g., "Secondhand Polaroid Music Video Clips")

### Step 2: Open the Project Folder

1. Click on the folder containing your videos
2. Switch to **List view** (button in top right) for easier navigation
3. You'll see all files with name, size, and modification date

### Step 3: Download Individual Files

1. **Click on a file** → opens preview panel with video player
2. In the preview panel, you'll see buttons:
   - **Rename** - change filename
   - **Download** - download to your computer
   - **Move** - move to different folder
   - **Delete** - remove file
   - **Close** - close preview
3. Click **Download** → file downloads

### File Download Behavior

**Important:** Files download with **GUID filenames** like:
```
c267e01b-7461-456e-ad60-6ff6fc47fa8c
```

After downloading, you'll need to **rename files** to match their original names.

### Step 4: Locate Downloaded Files

1. Check `~/Downloads/` for the GUID-named files
2. Or check `chrome://downloads/` in browser
3. Click "Show in Finder" to locate each file

### Step 5: Rename Files

After downloading, rename files to match their original names:
```bash
# Example
mv ~/Downloads/c267e01b-7461-456e-ad60-6ff6fc47fa8c ~/Downloads/video_01_attic_sunlight.mp4
```

Or use a renaming script (see below).

---

## Bulk Download (Manual Process)

Currently, GenSpark AI Drive does **not** have a bulk download feature. You must:

1. Click each file individually
2. Click Download
3. Close preview
4. Repeat for all files

**Time estimate:** ~30 seconds per file = ~10 minutes for 21 files

---

## Download API (Advanced)

GenSpark uses this endpoint for downloads:
```
https://www.genspark.ai/api/aidrive/download/files/?f_id={file_id}
```

The `file_id` appears in the URL hash when previewing a file:
```
#p_fid=3bb75e61-396b-44cc-90cf-31fcfbb66264
```

**Potential automation:** If you can extract all file IDs, you could batch download using `curl` with browser cookies.

---

## Automation with Maria (Clawdbot)

Maria can automate downloads via browser control:

1. Navigate to AI Drive folder
2. For each file:
   - Click file row → preview opens
   - Click Download button
   - Click Close button
3. Files download to ~/Downloads/ with GUID names
4. Rename files after download

**Command:** "Maria, download all files from GenSpark AI Drive folder [folder name]"

---

## Troubleshooting

### Files download with GUID names
This is normal GenSpark behavior. Use the Status panel to see original filenames, then rename after download.

### Can't find downloaded files
1. Check `chrome://downloads/`
2. Click "Show in Finder" on recent downloads
3. Files may be in a profile-specific download folder

### Download fails
- Refresh the page and try again
- Check if you're still logged into GenSpark
- Some files may take longer to prepare for download

---

## File Organization Recommendation

After downloading all clips for a music video:

```
/projects/music-video-app/public/clips-{song-name}/
├── video_01_attic_sunlight.mp4
├── video_02_keepsake_box.mp4
├── video_03_scattered_photos.mp4
... etc
```

Create an `asset-manifest.json` for Remotion to use:
```json
{
  "projectName": "Secondhand Polaroid",
  "clips": [
    {"scene": 1, "file": "video_01_attic_sunlight.mp4", "duration": 8},
    {"scene": 2, "file": "video_02_keepsake_box.mp4", "duration": 8}
  ]
}
```

---

## Quick Reference

| Task | Where | How |
|------|-------|-----|
| Find generated videos | AI Drive → folder | Click folder name |
| Preview video | File list | Click file row |
| Download single file | Preview panel | Click "Download" button |
| See original filename | Status panel (right side) | Shows "video_xx_name.mp4" |
| Bulk download | Manual only | Download each file individually |

---

## Integration with Video Pipeline

After downloading:
1. Move/rename files to project folder
2. Update `clips.json` with file paths
3. Run Remotion render: `npx remotion render`
