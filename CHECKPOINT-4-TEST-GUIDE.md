# Checkpoint 4: Test Verification Guide

## Overview
This guide will help you verify that the greeting widget and focus timer components are working correctly by running the test suites in your browser.

## Prerequisites
- A modern web browser (Chrome, Firefox, Edge, or Safari)
- The test files are already in your project root directory

## Test Files to Run

### Greeting Widget Tests

#### 1. Property-Based Tests (Recommended - Most Comprehensive)
**File:** `test-greeting-properties.html`

**What it tests:**
- Property 1: Time format consistency (100 random time values)
- Property 2: Date format completeness (100 random dates)
- Property 3: Time-based greeting accuracy (100 random times)
- Boundary transitions for all greeting time ranges

**How to run:**
1. Open `test-greeting-properties.html` in your browser
2. The tests will run automatically
3. Look for the summary at the bottom showing "Total Tests: X | Passed: X | Failed: 0"
4. All tests should show green checkmarks (✓)

**Expected result:** All tests pass with green checkmarks

---

#### 2. Visual Widget Test
**File:** `test-greeting-widget.html`

**What it tests:**
- Visual display of the greeting widget
- Time display format (12-hour with AM/PM)
- Date display format (weekday, month, day)
- Greeting message accuracy
- Widget methods (formatTime, formatDate, getTimeBasedGreeting)

**How to run:**
1. Open `test-greeting-widget.html` in your browser
2. Tests run automatically after page load
3. Check the "Automated Tests" section for results

**Expected result:** All tests pass (green background)

---

### Focus Timer Tests

#### 3. Comprehensive Unit Tests (Recommended)
**File:** `test-timer-unit.html`

**What it tests:**
- Timer initialization (25 minutes / 1500 seconds)
- Display format (MM:SS with leading zeros)
- Start functionality (begins countdown, sets isRunning)
- Stop functionality (pauses, preserves time)
- Reset functionality (returns to 25:00)
- Countdown behavior (decrements by 1 second)
- Completion handling (stops at 00:00, shows notification)
- Edge cases (multiple start/stop cycles, reset during countdown)

**How to run:**
1. Open `test-timer-unit.html` in your browser
2. Tests run automatically with timed delays
3. Wait about 10-15 seconds for all tests to complete
4. Check the summary at the bottom

**Expected result:** All tests pass with green checkmarks (✓)

---

#### 4. Basic Timer Test
**File:** `test-focus-timer.html`

**What it tests:**
- Basic timer functionality
- Manual testing interface

**How to run:**
1. Open `test-focus-timer.html` in your browser
2. Tests run automatically
3. You can also manually test the timer controls

**Expected result:** All automated tests pass

---

## Quick Verification Checklist

Run these tests in order and check off each one:

- [ ] **test-greeting-properties.html** - All property tests pass
- [ ] **test-greeting-widget.html** - All widget tests pass
- [ ] **test-timer-unit.html** - All timer unit tests pass
- [ ] **test-focus-timer.html** - All basic timer tests pass

## What to Look For

### ✅ Passing Tests
- Green background or green checkmarks (✓)
- Summary shows "Passed: X" matching "Total Tests: X"
- No red backgrounds or red X marks (✗)

### ❌ Failing Tests
- Red background or red X marks (✗)
- Error messages in the test results
- Summary shows "Failed: X" where X > 0

## Reporting Results

After running all tests, please report:

1. **All tests pass** - I can mark the checkpoint as complete
2. **Some tests fail** - Share which tests failed and any error messages

## Troubleshooting

### If tests don't run automatically:
- Check the browser console (F12) for JavaScript errors
- Make sure you're opening the HTML files directly (not through a file:// URL restriction)
- Try a different browser

### If you see "fast-check is not defined":
- Check your internet connection (fast-check loads from CDN)
- The property tests require internet to load the fast-check library

### If timer tests seem stuck:
- Wait 10-15 seconds - some tests use setTimeout for timing verification
- Check the browser console for errors

## Next Steps

Once you've verified all tests pass, let me know and I'll:
1. Mark Checkpoint Task 4 as complete
2. Report back to the orchestrator
3. The project can proceed to Task 5 (Task Manager Component)
