---
name: ui-delivery
emoji: 🎨
description: UI/UX delivery standards and verification protocol
---

# UI Delivery Protocol

> **Tooling Note:** Commands use `playwright-cli`, an internal wrapper around Playwright. If unavailable, use standard Playwright: `npx playwright <command>`

## 🎨 MANDATORY FOR ALL UI WORK

Before marking ANY UI task complete, you MUST:

### 1. Visual Verification (Screenshots)

```bash
# Open the page
playwright-cli open <url-or-file-path>

# Screenshot at mobile breakpoint
playwright-cli run-code "window.resizeTo(375, 812)"
playwright-cli screenshot --full-page ./qa-screenshots/mobile.png

# Screenshot at tablet breakpoint  
playwright-cli run-code "window.resizeTo(768, 1024)"
playwright-cli screenshot --full-page ./qa-screenshots/tablet.png

# Screenshot at desktop breakpoint
playwright-cli run-code "window.resizeTo(1440, 900)"
playwright-cli screenshot --full-page ./qa-screenshots/desktop.png
```

### 2. Console Error Check

```bash
playwright-cli console error
```

**Zero console errors from application code.** 

What counts as an error:
- `console.error()` calls from your code
- Uncaught exceptions
- Failed network requests (4xx/5xx)

What may be noted but doesn't block:
- Warnings from third-party libraries (document with link to issue)
- Deprecation warnings

**Exception Process:** If a known library produces unavoidable errors, add to `/docs/known-console-errors.md` with ticket link.

### 3. Build Verification

```bash
# For React/Vite projects
npm run build

# Must complete with no errors
```

### 4. Accessibility Check (Mandatory)

```bash
# Run automated accessibility scan
node scripts/run-axe.mjs <path>
```

**Zero critical or serious violations.**

Checks include:
- Color contrast (WCAG AA)
- ARIA labels on interactive elements
- Keyboard navigation
- Focus indicators

If violations exist:
1. Fix critical/serious issues
2. Document minor issues with remediation plan

### 6. QA Gate (Mandatory)

```bash
node scripts/qa-gate.mjs <path> ui
```

**Must exit with code 0 (PASS)** before delivery.

Exit codes:
- 0 = ✅ PASS — Ready to ship
- 1 = 🟡 REVISE — Fixable issues, re-run
- 2 = 🔴 REJECT — Fundamental problems, rebuild

### 7. Adversarial Review (Mandatory)

```bash
node scripts/adversarial-review.mjs <deliverable> ui
```

**Must get PASS or REVISE (not REJECT).**

Scoring:
- 80-100 = ✅ PASS — Ship it
- 70-79 = 🟡 REVISE — Address issues, re-review
- 0-69 = 🔴 REJECT — Rebuild from scratch

### 5. Adversarial Review

```bash
node scripts/adversarial-review.mjs <deliverable> ui
```

**Must get PASS or REVISE (not REJECT).**

---

## ✅ DELIVERY CHECKLIST

Every UI deliverable must include:

- [ ] Mobile screenshot (375px) — saved as `[ticket]-mobile.png`
- [ ] Tablet screenshot (768px) — saved as `[ticket]-tablet.png`
- [ ] Desktop screenshot (1440px) — saved as `[ticket]-desktop.png`
- [ ] Console errors: 0 from app code
- [ ] Accessibility: 0 critical/serious violations
- [ ] Build: PASS
- [ ] QA gate: PASS (exit 0)
- [ ] Adversarial review: PASS (80-100) or REVISE (70-79)

**Screenshot Naming:** `./qa-screenshots/[date]/[ticket-id]-[breakpoint].png`

**Artifact Storage:** Attach screenshots to PR or upload to shared storage.

---

## 📤 COMPLETION MESSAGE TEMPLATE

```
✅ [Task Name] Complete

**Screenshots:**
📱 Mobile: ./qa-screenshots/2026-02-15/ABC-123-mobile.png
📱 Tablet: ./qa-screenshots/2026-02-15/ABC-123-tablet.png
🖥️  Desktop: ./qa-screenshots/2026-02-15/ABC-123-desktop.png

**Quality Checks:**
✅ Build: PASS (no errors)
✅ Console: 0 app errors (3 third-party warnings noted)
✅ Accessibility: 0 critical/serious violations
✅ QA Gate: PASS (exit 0)
✅ Adversarial: PASS (82/100)

**Deliverables:**
- /path/to/file1
- /path/to/file2

**Logs:**
- QA Gate: ./logs/qa-gate.log
- Adversarial: ./reports/adversarial-review.md

**Notes:** [any important info]
```

---

## 🚫 DO NOT DELIVER IF:

- Screenshots are missing
- Console has errors
- Build fails
- QA gate blocks
- Adversarial review rejects

---

## 🆘 STUCK?

If you can't get a clean screenshot or build:
1. Try to fix it yourself (30 min max)
2. If still stuck → notify Maria with specific error

```bash
./notify-maria.sh "UI issue: [specific problem]. Error: [message]. Help needed."
```

---

## 📚 EXAMPLE: Complete UI Workflow

```bash
# 1. Build the project
cd /projects/my-dashboard
npm run build

# 2. Open in browser
playwright-cli open ./dist/index.html

# 3. Take screenshots
mkdir -p ./qa-screenshots
playwright-cli run-code "window.resizeTo(375, 812)"
playwright-cli screenshot --full-page ./qa-screenshots/mobile.png

playwright-cli run-code "window.resizeTo(768, 1024)"
playwright-cli screenshot --full-page ./qa-screenshots/tablet.png

playwright-cli run-code "window.resizeTo(1440, 900)"
playwright-cli screenshot --full-page ./qa-screenshots/desktop.png

# 4. Check console
playwright-cli console error

# 5. Run QA gate
node scripts/qa-gate.mjs ./dist/index.html ui

# 6. Deliver with screenshots attached
```

---

**Last Updated:** Feb 15, 2026  
**Enforced By:** qa-gate.mjs, adversarial-review.mjs
