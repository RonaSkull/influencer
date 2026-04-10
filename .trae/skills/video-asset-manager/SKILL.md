---
name: video-asset-manager
description: Source video clips from Pexels API and GenSpark AI video generation for music video production. Takes scene plans from creative-director and downloads/organizes video assets. Use when gathering video footage for music videos or assembling video libraries for Remotion projects.
---

# Video Asset Manager

Source, download, and organize video clips for music video production using Pexels API and GenSpark AI generation.

## Workflow

### 1. Input: Scene Plan JSON

Receive scene plan from creative-director skill:
```json
{
  "scenes": [
    {
      "sceneNumber": 1,
      "clipKeywords": ["sunrise", "mountains", "golden hour"],
      "duration": 15
    }
  ]
}
```

### 2. Search Pexels for Stock Footage

**Pexels API Access:**
- Credentials: Ask McKinzie for Pexels API key
- Endpoint: `https://api.pexels.com/videos/search`
- Rate limit: 200 requests/hour (free tier)

**Search strategy:**
1. For each scene, search using clipKeywords
2. Filter by:
   - Orientation (landscape for YouTube, square/vertical for social)
   - Duration (prefer clips ≥ scene duration)
   - Quality (HD minimum, 4K preferred)
3. Download top 2-3 options per scene for flexibility

**Pexels search script:** See `scripts/search_pexels.py`

### 3. Generate AI Clips with GenSpark (PREFERRED METHOD)

**When to use GenSpark:**
- Abstract concepts (faith, hope, spiritual themes)
- Scenes where stock footage doesn't match
- Unique/custom visuals not available in stock libraries
- Cinematic quality needed (better than stock footage)
- Full music video production (all clips AI-generated)

**⚡ BATCH WORKFLOW (FAST - USE THIS!):**

See full documentation: `references/genspark-batch-workflow.md`

1. **Prepare all prompts** in numbered list format:
   ```
   Generate [N] videos using PixVerse model, 16:9 aspect ratio, 4K resolution:
   
   1. [Detailed cinematic prompt for scene 1]
   2. [Detailed cinematic prompt for scene 2]
   ... etc
   ```

2. **Submit to GenSpark:**
   - Go to https://www.genspark.ai (main homepage)
   - Paste ENTIRE prompt list into main textbox
   - Press Enter

3. **Confirm generation:**
   - GenSpark will ask to confirm
   - Reply: "A) Proceed with all [N] videos now. Use 8 second duration, 16:9 aspect ratio."

4. **Wait for completion:**
   - PixVerse: ~30 seconds per video
   - 21 videos ≈ 15-20 minutes total
   - Videos generate in parallel

5. **Download all clips** when complete

**Model:** PixVerse (official/pixverse/v5) - fast, high quality
**Duration:** 5s or 8s (prefer 8s for music videos)
**Aspect:** 16:9 landscape, 9:16 for shorts

**Prompt tips for cinematic quality:**
- Include camera movement: "slow push-in", "overhead drift"
- Specify lighting: "golden hour", "soft window backlight"
- Add film aesthetic: "35mm film grain", "shallow depth of field"
- Describe mood: "contemplative", "nostalgic", "ethereal"

### 4. Organize Assets

**Folder structure:**
```
project-name/
├── assets/
│   ├── scene-01-sunrise-mountains.mp4
│   ├── scene-02-walking-forest.mp4
│   ├── scene-03-ai-faith-abstract.mp4
│   └── scene-04-ocean-waves.mp4
├── scene-plan.json
└── asset-manifest.json
```

**Asset manifest:**
```json
{
  "projectName": "Song Title - Music Video",
  "createdAt": "2026-01-29",
  "assets": [
    {
      "sceneNumber": 1,
      "filename": "scene-01-sunrise-mountains.mp4",
      "source": "pexels",
      "pexelsId": "12345678",
      "duration": 18,
      "resolution": "1920x1080",
      "keywords": ["sunrise", "mountains", "golden hour"]
    },
    {
      "sceneNumber": 3,
      "filename": "scene-03-ai-faith-abstract.mp4",
      "source": "genspark",
      "prompt": "abstract light rays representing faith and hope",
      "duration": 10,
      "resolution": "1920x1080"
    }
  ]
}
```

### 5. Quality Check

Before passing to music-video-producer:
- [ ] All scenes have at least 1 clip sourced
- [ ] Clip durations ≥ scene duration (allow trimming)
- [ ] Resolution is consistent (1080p minimum)
- [ ] Files downloaded and playable
- [ ] Asset manifest generated
- [ ] Folder organized and labeled

## Scripts

### `scripts/search_pexels.py`

Search and download clips from Pexels:
```bash
python scripts/search_pexels.py \
  --scene-plan scene-plan.json \
  --output-dir assets/ \
  --api-key $PEXELS_API_KEY \
  --top-n 2
```

See `scripts/search_pexels.py` for implementation.

### `scripts/generate_genspark.py`

Generate AI clips with GenSpark:
```bash
python scripts/generate_genspark.py \
  --scene-plan scene-plan.json \
  --scenes 3,5,7 \
  --output-dir assets/
```

See `scripts/generate_genspark.py` for implementation.

## Reference Files

- `references/pexels-api-docs.md` - Pexels API usage and examples
- `references/genspark-prompts.md` - Effective prompts for AI video generation
- `references/genspark-batch-workflow.md` - Batch video generation process
- `references/genspark-download-workflow.md` - Downloading from AI Drive
- `references/video-quality-standards.md` - Resolution, format, codec requirements

## Deliverables

1. **Downloaded video clips** - Organized in `assets/` folder
2. **Asset manifest JSON** - Metadata for each clip
3. **Coverage report** - Which scenes have clips, which need alternatives

## Error Handling

**If Pexels search returns no results:**
- Try alternate keywords (synonyms)
- Expand search to related concepts
- Flag scene for GenSpark AI generation

**If clip quality is low:**
- Search for HD/4K alternatives
- Consider upscaling with AI (Topaz Video AI)
- Flag for manual review

**If API rate limit hit:**
- Queue remaining searches
- Resume after cooldown period
- Report estimated completion time
