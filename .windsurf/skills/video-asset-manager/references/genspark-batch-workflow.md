# GenSpark Batch Video Generation Workflow

*Last updated: 2026-01-31 by Maria*

## Overview

GenSpark (genspark.ai) can batch-generate multiple AI videos at once when you submit all prompts together. This is MUCH faster than generating one at a time.

## Step-by-Step Process

### 1. Prepare Your Prompts

Create a numbered list of all video prompts with specifications at the top:

```
Generate [N] videos using PixVerse model, 16:9 aspect ratio, 4K resolution:

1. [Detailed cinematic prompt for scene 1]

2. [Detailed cinematic prompt for scene 2]

... etc
```

**Key specifications to include:**
- **Model**: PixVerse (official/pixverse/v5) - fast, high quality
- **Aspect ratio**: 16:9 for standard video, 9:16 for vertical/shorts
- **Resolution**: 4K (or specify "highest quality")
- **Duration**: 5s or 8s (PixVerse v5 supports both)

### 2. Submit to GenSpark

1. Go to **https://www.genspark.ai** (main homepage)
2. Click the main text input box ("Ask anything, create anything")
3. Paste the ENTIRE prompt list (all videos at once)
4. Press Enter to submit

### 3. Confirm Generation

GenSpark will ask for confirmation with options like:
- A) Proceed with all videos now
- B) Start with a test batch
- C) Different number

**Reply:** "A) Proceed with all [N] videos now. Use 8 second duration for each, 16:9 aspect ratio."

### 4. Wait for Generation

- PixVerse generates ~30 seconds per video
- 21 videos ≈ 15-20 minutes total
- GenSpark processes them in parallel
- You'll see "Using Tool | Video Generation" for each

### 5. Download Videos

Once complete, each video will appear with a download option. Download all to a local folder organized by scene number.

## Prompt Writing Tips

For cinematic music video clips, include:

1. **Camera movement**: "slow push-in", "overhead drift", "POV shot"
2. **Lighting**: "golden hour", "soft window backlight", "warm amber tones"
3. **Film aesthetic**: "35mm film grain", "Super 8 style", "shallow depth of field"
4. **Mood**: "contemplative", "nostalgic", "ethereal", "melancholic"
5. **Specific details**: "dust particles visible", "lens flare", "light leaks"
6. **What to avoid**: "no people" if you want abstract/object shots

### Example Prompt Structure

```
[Camera type] shot of [subject/scene], [lighting description], 
[color palette], [film aesthetic], [specific visual details], 
[mood/atmosphere], [any exclusions]
```

**Good example:**
> Cinematic slow motion shot of golden sunlight streaming through a dusty attic window, particles floating in the air like memories, warm amber tones, 35mm film aesthetic, shallow depth of field, soft lens flare, contemplative mood, no people

## File Organization

Save generated clips to:
```
/projects/music-video-app/public/clips-[song-name]/
├── scene-01-[description].mp4
├── scene-02-[description].mp4
├── ...
└── scene-21-[description].mp4
```

## Integration with Music Video Pipeline

After downloading clips:
1. Update `clips.json` with new file paths
2. Run Remotion render: `npx remotion render`
3. Compress for delivery: `ffmpeg` with appropriate settings

## Troubleshooting

**If GenSpark asks which model:**
- Use "PixVerse" or "official/pixverse/v5" for fast, quality results
- Veo 3 (Gemini) is higher quality but slower

**If a video fails:**
- Re-submit just that prompt individually
- Or regenerate with slightly modified wording

**Rate limits:**
- GenSpark handles batching automatically
- No need to wait between submissions

## Cost/Credits

- Each video uses GenSpark credits
- 21 videos = significant credit usage
- Check account balance before large batches

---

## Quick Reference

| Setting | Value |
|---------|-------|
| URL | https://www.genspark.ai |
| Model | PixVerse (official/pixverse/v5) |
| Duration | 8 seconds |
| Aspect | 16:9 (landscape) or 9:16 (vertical) |
| Resolution | 4K / highest available |
| Speed | ~30 sec/video generation |
