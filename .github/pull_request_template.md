# Summary

<!-- Summary of the PR -->
Short paragraph explaining what this PR does and why.

## Ticket/Issue
- [[FEATURE] Example Issue](url)
- [[FIX] Example Issue](url)

## What Changes

### Related Pages
<!-- Path — what it does or what changed -->
- `/example/page` — New page for X
- `/example/other-page` — Updated form validation for Y

### Related API
<!-- Method + endpoint — what it does or what changed -->
- `POST /api/example` — Creates new resource
- `PUT /api/example/[id]` — Updated to support new field

### Dependencies
<!-- Added:
Removed:
  Only list ones relevant to QA context -->
- Added: `example-lib` ^1.0.0 — used for X
- Removed: `old-lib` — no longer needed

### Infrastructure / Environment Changes
<!-- New services, env vars, config changes — especially anything that could break
the app if misconfigured -->
- New env var `EXAMPLE_URL` added, required for feature X to work

---
**TL;DR for QA:**
<!-- what to prioritize testing, and why -->
Focus on [specific flow/page], since [reason — e.g. core logic changed, high-risk area, etc].