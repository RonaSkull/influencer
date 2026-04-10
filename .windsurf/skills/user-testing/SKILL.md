---
name: user-testing
description: Perform comprehensive QA testing of web applications through browser automation. Navigate user flows, document bugs, check responsive design, capture screenshots, and report console errors. Use when testing websites, web apps (like PsalMix), or validating UI/UX before launch or after updates.
---

# User Testing & QA Agent

Systematically test web applications, document issues, and deliver comprehensive QA reports.

## Workflow

### 1. Test Planning

**Required inputs:**
- Application URL (staging or production)
- Test account credentials (or ability to create one)
- Test scope definition

**Determine scope:**
- **Full journey test** - End-to-end user flows (signup → core feature → logout)
- **Feature-specific test** - Single feature deep dive (e.g., search, player, checkout)
- **Regression test** - Verify existing features still work after updates
- **Device test** - Mobile vs desktop responsiveness
- **Browser test** - Cross-browser compatibility (Chrome, Safari, Firefox)

### 2. Execute Testing Session

**Use browser tool for all interactions:**
```
browser action=open targetUrl=https://app.psalmix.com
browser action=snapshot
browser action=act request={kind:"click", ref:"button-login"}
browser action=screenshot
```

**Standard testing flow:**

#### A. Initial Load Test
1. Open app URL
2. Take snapshot + screenshot
3. Check browser console for errors
4. Verify page title, meta tags, favicon
5. Test initial load performance (any slow elements?)

#### B. Authentication Flow
1. Navigate to signup/login
2. Test form validation (empty fields, invalid email, etc.)
3. Create new account OR login with test credentials
4. Verify redirect after auth
5. Check session persistence (refresh page, still logged in?)

#### C. Core User Flows
For each major feature:
1. Navigate to feature
2. Take screenshot (before state)
3. Perform main action (search, play song, add to playlist, etc.)
4. Verify result (did it work?)
5. Take screenshot (after state)
6. Check for error messages
7. Test edge cases (empty states, long text, special characters)

#### D. Navigation & UI
1. Test all main menu items
2. Click all buttons/links (verify destinations)
3. Test breadcrumbs/back navigation
4. Verify modals open/close correctly
5. Test dropdowns, tooltips, hover states

#### E. Responsive Design
1. Test desktop view (1920x1080)
2. Test tablet view (768x1024)
3. Test mobile view (375x667)
4. Check for:
   - Text overflow/truncation
   - Broken layouts
   - Unreadable small text
   - Buttons too small to tap
   - Horizontal scrolling (bad)

#### F. Data Validation
1. Test forms with invalid inputs
2. Try to break things (negative testing)
3. Check error messages are helpful
4. Verify required fields enforce validation
5. Test file uploads (if applicable)

#### G. Performance Checks
1. Note slow-loading pages
2. Check for:
   - Missing images (broken img tags)
   - Console warnings/errors
   - Network failures (inspect network tab)
   - Memory leaks (does tab slow down over time?)

### 3. Document Findings

**Bug report format:**
```markdown
## Bug #1: [Title]
**Severity:** Critical / High / Medium / Low
**Location:** Page/component name
**Steps to Reproduce:**
1. Navigate to X
2. Click Y
3. Enter Z

**Expected:** Should show success message
**Actual:** Shows error "undefined"
**Screenshot:** [bug-01-screenshot.png]
**Console Error:** TypeError: Cannot read property 'name' of undefined
**Browser:** Chrome 121 on macOS
**Date Found:** 2026-01-29
```

**UX improvement format:**
```markdown
## UX Issue #1: [Title]
**Priority:** High / Medium / Low
**Location:** Page/component name
**Observation:** Button text is unclear, says "Submit" instead of "Create Playlist"
**Recommendation:** Change button text to be more descriptive
**Impact:** Minor confusion for new users
**Screenshot:** [ux-01-screenshot.png]
```

### 4. Generate QA Report

**Final deliverable structure:**

```markdown
# QA Report: [App Name]
**Test Date:** 2026-01-29
**Tester:** Fitz (AI Agent)
**Test Scope:** Full user journey
**Browser:** Chrome 121 / Safari 17
**Devices:** Desktop (1920x1080), Mobile (375x667)

---

## Executive Summary
- ✅ **Major flows working:** Login, Browse, Play Song
- ⚠️ **Issues found:** 3 critical, 5 medium, 8 low
- 🎯 **Recommended fixes:** Focus on #1, #2, #7 before launch

---

## Test Coverage

### ✅ Passed Tests
- User signup flow
- Song playback
- Search functionality
- Mobile responsive design

### ❌ Failed Tests
- Password reset (error 500)
- Playlist creation (UI bug)
- Share button (broken link)

---

## Critical Issues (Fix Before Launch)

### Bug #1: Login fails with valid credentials
**Severity:** Critical
[details...]

### Bug #2: Audio player crashes on iOS
**Severity:** Critical
[details...]

---

## Medium Priority Issues

[List medium bugs...]

---

## Low Priority / Nice-to-Have

[List minor UX improvements...]

---

## Screenshots & Evidence

[Attach all screenshots, organize by category]

---

## Console Errors Log

```
[Error] TypeError: Cannot read property 'name' of undefined
  at MusicPlayer.tsx:45
```

---

## Recommendations

1. **Before App Store submission:**
   - Fix critical bugs #1, #2, #3
   - Test on actual iOS device (not just simulator)
   - Verify all external links work

2. **Post-launch improvements:**
   - Improve search relevance
   - Add loading states to buttons
   - Polish empty states

---

## Test Artifacts

- Stored screenshots: `qa-reports/psalmix-2026-01-29/screenshots/`
- Browser console log: `qa-reports/psalmix-2026-01-29/console.log`
- Test session recording: [if available]
```

### 5. Severity Guidelines

**Critical:**
- App crashes or major functionality broken
- Data loss or corruption
- Security vulnerabilities
- Cannot complete core user flow

**High:**
- Feature doesn't work as intended
- Poor UX on major flow
- Broken on specific browser/device
- Performance severely degraded

**Medium:**
- Minor functionality issue
- Confusing UI/UX
- Cosmetic bugs that affect usability
- Missing error messages

**Low:**
- Typos, text issues
- Cosmetic-only bugs
- Nice-to-have features
- Minor polish opportunities

## Reference Files

- `references/testing-checklists.md` - Comprehensive checklists for different app types
- `references/common-bugs.md` - Patterns of common web app issues
- `references/accessibility-testing.md` - WCAG compliance checks

## Tools & Commands

**Browser automation commands:**
- `browser action=snapshot` - Get DOM structure
- `browser action=screenshot` - Capture visual state
- `browser action=console` - Get console logs
- `browser action=act` - Click, type, navigate

**Organize test artifacts:**
```bash
mkdir -p qa-reports/[app-name]-[date]/{screenshots,logs}
```

**Save report:**
```bash
# Save to project folder
qa-reports/psalmix-2026-01-29/QA-REPORT.md
```

## Quality Checklist

Before submitting QA report:
- [ ] Tested all critical user flows
- [ ] Captured screenshots of all issues
- [ ] Severity assigned to each bug
- [ ] Reproduction steps are clear
- [ ] Console errors captured
- [ ] Tested on multiple screen sizes
- [ ] Tested on multiple browsers (if applicable)
- [ ] Recommendations prioritized
- [ ] Report is well-organized and scannable

## Example Test Scenarios

### E-commerce App
- Add to cart → checkout → payment
- Test coupon codes
- Verify order confirmation email

### Music Streaming App (PsalMix)
- Signup → browse → play song → create playlist
- Test playback controls (play/pause/skip)
- Verify lyrics display
- Check search accuracy
- Test offline mode (if applicable)

### SaaS Dashboard
- Login → create project → invite user → set permissions
- Test data visualization
- Export/import functionality
- API integrations

### Content Site
- Navigation → read article → comment → share
- Test SEO meta tags
- Verify social sharing
- Check mobile reading experience
