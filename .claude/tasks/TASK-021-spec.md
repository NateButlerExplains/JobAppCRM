# TASK-021: Email Classification Tuning & Metrics

## Executive Summary

**Goal:** Validate that the email classification pipeline achieves **90% detection and mapping accuracy** on real Outlook emails before proceeding to feature work.

**Why:** The Gemini classifier is the core of the CRM. If it's only 70% accurate, the entire application suffers from silent failures (emails not classified, mislinked to wrong apps). This task instruments the pipeline and tests against real data to ensure quality.

**Scope:** 
- Add confidence logging to classify every email with a score
- Run a real sync against your actual Outlook inbox
- Measure accuracy on 50+ real emails
- Tune thresholds if needed
- Document findings

**Timeline:** This is a ONE-SESSION task. Complete all 4 phases in order.

---

## Phase 1: Instrumentation (Backend Logging)

### What to Add

**File: `backend/gemini_classifier.py`**
- Update `classify_email()` to return confidence score alongside classification
- Currently returns: `{"email_type": "offer", "confidence": 0.95}`
- Ensure score is a float 0.0–1.0

**File: `backend/email_processor.py`**
- In `_process_single_email()`, log each email classification:
  ```
  [2026-04-08 16:45] CLASSIFY | email_id=123 | subject="Your Application" | 
  type=offer | confidence=0.92 | linked_to=app_id:5 | reasoning=salary_mentioned
  ```
- Log **before** and **after** linking (so we see both classification and link accuracy)
- Use logger.info() for every email (verbose, but temporary for tuning)

**File: `backend/models.py`**
- Add columns to `SyncLog` table (or create a new `classification_log` table):
  - `email_id` (FK to emails)
  - `classification` (TEXT, e.g., "offer")
  - `confidence` (REAL, 0.0–1.0)
  - `linked_app_id` (INT, NULL if unlinked)
  - `linking_confidence` (REAL, 0.0–1.0)
  - `is_correct` (BOOL, NULL = not yet verified)
  
- Add method `SyncLog.log_email_classification(db, sync_log_id, email_id, classification, confidence, linked_app_id, linking_confidence)`

**File: `.env` (new config options)**
```
# Classification tuning (Phase 1)
GEMINI_CONFIDENCE_THRESHOLD=0.7
CLASSIFICATION_LOG_LEVEL=debug
CLASSIFICATION_LOG_FILE=./logs/classification.log
```

### Acceptance Criteria for Phase 1
- ✅ Every email processed logs: classification, confidence, app_id
- ✅ Log format is machine-readable (JSON or CSV, easy to parse later)
- ✅ Config knobs in .env control threshold + log level
- ✅ No test failures; existing sync still works

---

## Phase 2: Test Against Real Environment

### Step 1: Run a Real Sync

1. Open Settings page in your browser
2. Click **"Run Sync Now"** button
3. Watch the progress: "Sync running: 15/50 emails processed..."
4. Wait for completion

This will sync your last 7 days of Outlook emails and classify each one.

### Step 2: Review Classification Log

After sync completes:
```bash
# View the classification log
tail -100 logs/classification.log

# Or extract to CSV for analysis
python3 -c "
import json, csv
from pathlib import Path

# Parse logs (assumes JSON format)
with open('logs/classification.log') as f:
    emails = [json.loads(line) for line in f]

# Write CSV
with open('classification_report.csv', 'w') as out:
    w = csv.DictWriter(out, fieldnames=['email_id', 'subject', 'type', 'confidence', 'app_id', 'correct'])
    w.writeheader()
    for e in emails:
        w.writerow({
            'email_id': e['email_id'],
            'subject': e['subject'][:50],
            'type': e['classification'],
            'confidence': e['confidence'],
            'app_id': e['linked_app_id'],
            'correct': ''  # You'll fill this in manually
        })

print('Wrote classification_report.csv')
"
```

### Step 3: Manual Verification (50+ Emails)

For each email in the log, **manually verify**:
1. **Is the classification correct?** (e.g., is it really an "offer" email?)
2. **Is the linked app correct?** (e.g., does it belong to the app it was linked to?)

Mark as:
- ✅ **Correct** if both classification AND linking are right
- ❌ **Wrong** if either classification OR linking is wrong
- ⚠️ **Ambiguous** if it's debatable (e.g., "Maybe an interview request, maybe a rejection?")

Update the CSV with your verdicts in the `correct` column.

### Step 4: Calculate Baseline Accuracy

```
Accuracy = (# Correct) / (# Total emails reviewed)
Target: ≥90%

Example:
45 correct out of 50 = 90% ✅
42 correct out of 50 = 84% ❌ (needs tuning)
```

### Acceptance Criteria for Phase 2
- ✅ Ran real sync against your Outlook inbox
- ✅ Reviewed at least 50 classified emails
- ✅ Manually verified classification + linking accuracy
- ✅ Calculated baseline accuracy %
- ✅ Created CSV report with verdicts

---

## Phase 3: Tuning (If <90%)

### If Baseline is ≥90% → Skip to Phase 4 ✅

### If Baseline is <90% → Investigate Failure Modes

**Common failure patterns to look for:**
1. **False positives:** Email classified as "offer" but it's actually spam or HR generic message
   - Fix: Raise `GEMINI_CONFIDENCE_THRESHOLD` to 0.8 or 0.85
   
2. **False negatives:** Real offer email classified as "other" or "interview request"
   - Fix: Improve Gemini prompt in `gemini_classifier.py` to be more specific
   - Example: "Classify as 'offer' ONLY if it includes: salary, start date, or 'We are pleased to offer'"
   
3. **Linking errors:** Classification correct but linked to wrong app (e.g., offer for Company A linked to Company B)
   - Fix: Check `application_linker.py` matching logic; may need to raise domain match threshold
   
4. **Ambiguous emails:** Emails where even humans disagree (forward chains, HR generic messages)
   - Fix: Document as known limitation; these go to Unlinked Tray (acceptable)

### Tuning Workflow

1. **Identify top 3 failure modes** from your 50-email sample
2. **For each failure mode:**
   - Adjust one knob (threshold, prompt, or linking logic)
   - Re-run sync on a fresh 20-email sample
   - Measure new accuracy
   - If improved: keep the change, document it
   - If worse: revert it
3. **Repeat until ≥90%**

### Acceptance Criteria for Phase 3
- ✅ Identified specific failure modes
- ✅ Documented tuning decisions (what changed, why, impact)
- ✅ Re-tested after tuning
- ✅ Achieved ≥90% accuracy (or documented why it's harder than expected)

---

## Phase 4: Documentation

### Create `docs/CLASSIFICATION_METRICS.md`

This document is the **permanent record** of your tuning work. It should include:

**Section 1: Baseline Results**
```
## Baseline Accuracy (Initial Test)

- **Date:** 2026-04-08
- **Emails Tested:** 50 (from last 7 days of Outlook inbox)
- **Correct Classifications:** 45
- **Correct Mappings:** 45
- **Accuracy:** 90%
- **Threshold Used:** GEMINI_CONFIDENCE_THRESHOLD=0.7

### Breakdown by Email Type
- Offers: 10 tested, 9 correct (90%)
- Interview Requests: 15 tested, 14 correct (93%)
- Rejections: 8 tested, 7 correct (88%)
- Application Confirmations: 12 tested, 10 correct (83%)
- Other: 5 tested, 5 correct (100%)
```

**Section 2: Failure Modes (If Any)**
```
## Known Failure Modes

1. **False Positives on HR Newsletters**
   - Problem: HR generic "Check out our careers page" classified as "offer"
   - Frequency: 2 out of 50 emails
   - Impact: Low (emails still go to Unlinked Tray, not auto-linked)
   - Fix Attempted: Raised threshold to 0.8, reduced false positives to 1/50
   
2. **Weak Linking When Multiple Apps Match**
   - Problem: Email about "Engineer" role linked to first app, not correct one
   - Frequency: 3 out of 50 emails
   - Impact: Medium (user has to manually re-link)
   - Fix: Increased domain-match threshold from 0.9 to 0.95 (reduced from 3 to 1)
```

**Section 3: Tuning Decisions**
```
## Tuning Iterations

### Iteration 1: Baseline (2026-04-08)
- Config: `GEMINI_CONFIDENCE_THRESHOLD=0.7`
- Result: 45/50 correct (90%)
- Action: Meet target, no tuning needed ✅

### Iteration 2: (if needed)
- Config: `GEMINI_CONFIDENCE_THRESHOLD=0.8`
- Result: 47/50 correct (94%)
- Action: Exceeded target, adopt this threshold ✅
```

**Section 4: Confidence Distribution**
```
## Confidence Score Distribution

This shows how many emails fall into each confidence bucket:

- 0.90–1.00: 28 emails (56%) → high confidence, reliable
- 0.70–0.90: 18 emails (36%) → medium, occasional errors
- 0.50–0.70: 4 emails (8%) → low, unreliable
- <0.50: 0 emails → would be rejected

**Observation:** Emails >0.85 are 98% accurate; emails 0.70–0.85 drop to 85% accuracy.
**Recommendation:** Consider `GEMINI_CONFIDENCE_THRESHOLD=0.75` for production.
```

**Section 5: Recommendations**
```
## Recommendations for Production

1. **Threshold:** Use `GEMINI_CONFIDENCE_THRESHOLD=0.75` (better than 0.7, safer than 0.8)
2. **Prompt Improvement:** Add to Gemini prompt: "Classify as 'offer' ONLY if salary or start date mentioned"
3. **Linking Logic:** Require domain match >0.95 for auto-linking (user reviews domain mismatches)
4. **Unlinked Tray:** Monitor, but acceptable for 5–10% of emails (ambiguous ones)
5. **User Education:** Document that emails with low confidence go to Unlinked Tray; this is intentional
```

### Acceptance Criteria for Phase 4
- ✅ CLASSIFICATION_METRICS.md documents baseline accuracy
- ✅ Known failure modes documented (if any)
- ✅ Tuning iterations documented with results
- ✅ Confidence distribution analyzed
- ✅ Clear recommendations for production settings
- ✅ File is readable by non-technical users

---

## Definition of Done (All 4 Phases)

- ✅ Confidence scores logged for every email in real sync
- ✅ Baseline accuracy measured on 50+ real Outlook emails
- ✅ Accuracy ≥90% achieved (or documented with improvement plan)
- ✅ CLASSIFICATION_METRICS.md complete with findings
- ✅ Config tuning documented (thresholds, prompts, linking logic)
- ✅ No regression in existing tests
- ✅ Code ready for CEO review

---

## Key Files to Modify

1. `backend/gemini_classifier.py` — Ensure confidence scores returned
2. `backend/email_processor.py` — Add logging for every classification
3. `backend/models.py` — Add classification_log columns/methods
4. `.env` — Add GEMINI_CONFIDENCE_THRESHOLD, CLASSIFICATION_LOG_LEVEL
5. `docs/CLASSIFICATION_METRICS.md` — Create (new file)

## Testing the Pipeline

**Before starting:**
```bash
source venv/bin/activate
python -m pytest tests/ -x  # Ensure no regressions
```

**After Phase 1 changes:**
```bash
# Verify logging works
CLASSIFICATION_LOG_LEVEL=debug python backend/app.py &
# Manually trigger sync via Settings UI
# Check logs/classification.log exists and has entries
```

---

## Timeline Estimate

- **Phase 1 (Instrumentation):** 30–45 min
- **Phase 2 (Real Test):** 15 min (sync) + 30 min (verification) = 45 min
- **Phase 3 (Tuning):** 30–90 min (depends if ≥90% achieved immediately)
- **Phase 4 (Documentation):** 15–30 min

**Total:** 2–3 hours one-shot, then done.

---

## Questions for CEO (If Stuck)

- If accuracy stays <85% after tuning: Should we accept 85% as "good enough" or investigate deeper?
- If Gemini's free tier keeps hitting rate limits: Should we add backoff/retry logic?
- If linking errors are common: Should we show a "Verify Linking" step before finalizing?

**Proceed with Phase 1 instrumentation now.** Report back after real sync with baseline accuracy.
