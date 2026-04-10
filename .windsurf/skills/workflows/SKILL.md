---
name: workflows
description: Library of reusable micro-workflows. Quick patterns for common tasks that have been figured out and saved. Check here before reinventing the wheel.
---

# Workflow Library

**Purpose:** Save successful patterns so they can be reused instantly instead of figuring them out again.

## When to Use
- Before starting any task, check if a workflow exists
- After figuring something out, save it here immediately
- When a task takes >5 minutes that should take <1 minute

## Workflow Index

### Browser Automation ✅
- `browser-mediavine-csv.md` — Download Mediavine CSV export ✅
- `browser-pdf-generation.md` — Generate PDF from any page (with verification!) ✅

### Sub-Agent Patterns ✅
- `parallel-research.md` — Spawn multiple Haiku agents for research ✅
- `overnight-build.md` — Hand off complex build to Codex overnight ✅

### Data Tasks (TODO)
- `etsy-inventory-export.md` — Export Etsy shop listings
- `ga4-api-query.md` — Query GA4 via API
- `late-api-posts.md` — Fetch scheduled posts from Late.dev

### File Operations (TODO)
- `markdown-to-pdf.md` — Convert .md to PDF
- `bulk-file-rename.md` — Rename files with patterns

### Content Generation (TODO)
- `etsy-listing-copy.md` — Generate Etsy title, tags, description

---

## Adding a New Workflow

When you figure something out:

1. Create `workflows/<name>.md`
2. Use the template below
3. Add to the index above
4. Test it works before considering it "saved"

### Template

```markdown
# Workflow: [Name]

**Purpose:** [What this does]
**Time saved:** [X min → Y sec]
**Last verified:** [Date]

## Prerequisites
- [What needs to be set up first]

## Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Example

\`\`\`bash
# Actual commands or code
\`\`\`

## Gotchas
- [Thing that can go wrong and how to avoid it]

## Related
- [Link to related workflows or docs]
```

---

## Rules

1. **Immediate capture** — Don't wait. Save it NOW while it's fresh.
2. **Include gotchas** — The edge cases are the valuable part.
3. **Test before saving** — A broken workflow is worse than none.
4. **Keep it atomic** — One workflow = one task. Chain them if needed.
5. **Update when broken** — If something changes, update the workflow.
