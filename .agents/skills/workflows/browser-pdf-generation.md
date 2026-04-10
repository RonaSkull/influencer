# Workflow: Browser PDF Generation

**Purpose:** Generate PDF from any web page or local HTML file
**Time saved:** 5 min → 30 sec
**Last verified:** Feb 2, 2026

## Prerequisites
- Clawdbot browser (clawd profile) available
- Target URL or file path

## Steps

1. **Open the target URL and save the targetId**
```
browser open profile=clawd targetUrl=<url>
→ Save the targetId from response
```

2. **VERIFY with screenshot** (Critical!)
```
browser screenshot targetId=<saved_id>
→ Visually confirm you're on the correct page
```

3. **Generate PDF using the specific targetId**
```
browser pdf profile=clawd targetId=<saved_id>
→ Returns FILE:/path/to/generated.pdf
```

4. **Copy/send the file**
```
message send filePath=<pdf_path> caption="Your PDF"
```

## Example

```javascript
// Open local HTML report
const tab = await browser({ action: 'open', profile: 'clawd', targetUrl: 'file:///path/to/report.html' });

// Verify (always!)
await browser({ action: 'screenshot', targetId: tab.targetId });

// Generate PDF
const pdf = await browser({ action: 'pdf', profile: 'clawd', targetId: tab.targetId });

// Send
await message({ action: 'send', filePath: pdf.path, caption: 'Report PDF' });
```

## Gotchas

⚠️ **NEVER trust targetUrl alone for PDF generation**
- If multiple tabs are open, browser may capture the wrong one
- Sub-agents opening pages can change which tab is "active"
- ALWAYS verify with screenshot first

⚠️ **Use targetId, not just profile**
- The targetId pins you to a specific tab
- Without it, you get whatever tab happens to be in focus

## Related
- TOOLS.md → "Browser PDF Generation - LESSON LEARNED"
