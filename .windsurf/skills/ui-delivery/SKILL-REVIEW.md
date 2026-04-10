# Adversarial Review: SKILL.md
**Type:** content
**Reviewed:** 2026-02-15T22:58:17.001Z
**Cost:** $0.0066

Overall this is a solid, actionable UI delivery protocol — clear requirements, concrete commands, and a usable checklist. However there are several factual/technical inaccuracies, a few duplicated/ordered sections, missing practical guidance for edge cases (CI/headless/mobile emulation), and minor consistency/style problems that should be fixed before you "ship" this as the canonical standard.

Below I list specific issues and actionable fixes grouped by type.

1) Major factual / technical issues (must fix)
- Duplicate and mis-numbered sections
  - You have both "### 7. Adversarial Review" and later "### 5. Adversarial Review" with identical content. The numbered sequence also jumps (1–4, 6, 7, then 5). Action: renumber and remove the duplicate block so the steps read in logical order.
- window.resizeTo is unreliable for mobile emulation
  - Resizing the browser window with window.resizeTo does not fully emulate mobile (touch events, device pixel ratio, mobile user agent, viewport meta handling). This may produce misleading screenshots and QA misses. Action: replace/augment with Playwright device emulation (e.g., use device descriptors like "iPhone 12" or set viewport/userAgent via newContext). Example (brief): use playwright's device descriptor or setViewportSize in a script or playwright-cli option rather than relying on window.resizeTo.
- "playwright-cli console error" may not be a standard command
  - If playwrigt-cli is internal, document its availability; if not present, provide a robust fallback. Suggest a reliable alternative approach: capture console events in a short Playwright script and write to a structured log, or use browser logs in CI. Example: small script that listens for 'console' and filters console.error/unhandled exceptions and failed network responses.
- Counting failed network requests (4xx/5xx) as console errors is risky
  - Many 4xx/5xx responses come from third-party services or flaky staging backends and may be out of the implementer's control. Action: define scope — only treat app-originated API failures as blocking. Provide guidance for how to exclude known third-party endpoints or how to document exceptions.
- Accessibility "Zero critical or serious violations" — automated scan limitations not stated
  - Automated axe scans are useful but do not catch everything (screen reader semantics, keyboard traps, focus order nuance). Action: require at least a minimal set of manual checks (keyboard-only navigation, tab order, inspect one common screen with a screen reader or voiceover smoke test) and explicitly state what to do if axe shows false positives/false negatives.

2) Structure / process / checklist inconsistencies (fix)
- Screenshot naming inconsistency
  - The checklist says "saved as [ticket]-mobile.png" but "Screenshot Naming" says ./qa-screenshots/[date]/[ticket-id]-[breakpoint].png. Action: choose one canonical naming convention and apply it consistently (recommend the dated folder approach). Update examples and the completion template to match.
- Ordering of verification steps could be clearer
  - Typical flow: Build -> Open page -> Visual screenshots -> Console check -> Accessibility -> QA Gate -> Adversarial -> Deliver. Your doc currently lists Visual first, then Console, then Build. Action: reorder so Build verification runs before taking screenshots (otherwise screenshots might reflect an unbuilt dev server).
- QA gate and Adversarial gating logic overlap
  - You require both QA gate PASS (exit 0) and Adversarial PASS/REVISE. Clarify whether Adversarial REVISE still allows delivery if issues are minor or whether REVISE triggers a re-run only after fixes. Action: document the allowed combinations and explicit acceptance criteria.
- "Do not deliver if" list should reference the checklist items by name/expected outputs (i.e., include build log path, QA gate log, adversarial report)

3) Missing practical guidance (improve)
- CI and headless instructions missing
  - Provide recommended commands for CI/headless screenshots (how to run in headless mode, required environment variables, npm script examples), and whether the screenshots should be produced as artifacts in CI. Action: add a short CI subsection with sample commands and artifact upload guidance.
- Where to store artifacts / retention/permissions
  - "Attach screenshots to PR or upload to shared storage" is vague. Provide preferred storage (S3 bucket path, Google Drive folder, internal artifact store) and retention policy + access instructions.
- Known console errors exception format
  - The doc says add to /docs/known-console-errors.md with a ticket link — but give an example entry format (what fields to include: error message, stack, component, ticket link, owner, risk/mitigation).
- Escalation contact is underspecified
  - "notify Maria" — give a Slack handle, email, or escalation rotation / on-call instructions. Add SLAs if timeboxes are enforced (30 minutes is mentioned but could be clarified for different severity levels).
- Completion message template should include commit/branch/PR link
  - Add commit hash, branch, and PR link for traceability.

4) Accessibility specifics to add
- Require a short manual checklist in addition to axe:
  - Keyboard-only tab navigation on primary flows (log in, create item, submit)
  - Verify focus outline and focus order on at least one complex screen
  - Screen reader smoke test on one page (e.g., verify headings and form labels are announced)
- Define acceptable axe thresholds and what qualifies as "critical" vs "serious" in your scanning tool if not the default.

5) Style, clarity, and tone fixes (minor)
- Remove duplication and AI-ish fillers — doc is mostly direct, but remove small redundancies (two identical adversarial sections).
- Replace all-caps MUST with bold and a short rationale where appropriate (why is each step mandatory).
- Clarify "Third-party warnings may be noted but don't block" — give examples of what is acceptable to ignore and how to document it.
- Standardize emoji use: emojis are fine, but use them consistently (header or checklist only).

6) Security / privacy note (optional but recommended)
- Add a short note to avoid screenshots containing PII or sensitive data. If screenshots contain PII, require redaction or provide a secure storage/approval flow.

7) Minor editorial / copy issues
- "Zero console errors from application code." — consider "No console.errors originating from application code" (small grammar).
- The "Adversarial Review (Mandatory)" is repeated; remove redundancy.
- The "Tooling Note" should specify whether Playwright must be installed locally or piped through npx, and which minimum Node/Playwright versions are required.

8) SEO assessment (internal doc)
- Not applicable for public SEO, but for discoverability inside docs:
  - Add metadata/tags (audience: engineers/designers/QE), scope (web apps only? React/Vite only?), and a short changelog so readers know what's new since Last Updated.
  - Consider adding a short TL;DR "Quick pass" checklist at the top for engineers in a hurry.

9) Small recommended copy patches (examples you can paste)
- Replace window commands with an explicit alternative paragraph:
  - "Preferred: Use Playwright device emulation or set viewport in a scripted context. Example: npx playwright open --device='iPhone 12' <url> or create a newContext with devices['iPhone 12'] and capture a screenshot. Only use window.resizeTo for local exploratory checks."
- Known-console-errors.md sample entry:
  - "Date | Error Message | Component | Environment | Ticket | Owner | Rationale for exception"

10) Additional suggestions to raise quality
- Add a one-line purpose statement at top: who this applies to and rationale (reduce rework, prevent regressions, consistent quality).
- Add an example of a documented "minor accessibility issue remediation plan" so teams know what counts as acceptable.

VERDICT
- REVISE 🟡 (fixable issues, needs another pass)

Quality score: 78/100

Summary of why: The protocol is mostly complete and practical, but it contains important technical inaccuracies (mobile emulation method, console logging command assumptions), duplicated/mis-ordered sections, and missing operational details (CI/headless guidance, artifact storage, exception handling examples). Addressing the items above will bring this to a ship-ready standard.
