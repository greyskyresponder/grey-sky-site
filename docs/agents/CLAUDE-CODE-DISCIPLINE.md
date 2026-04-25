# Claude Code Discipline Protocol

**Applies to every Claude Code session for the Grey Sky Portal.**
ATLAS appends this to all Claude Code prompts. Non-negotiable.

---

## 1. Self-Review Gate

Before creating any PR or reporting "done," re-read every file you changed with these 5 checks:

1. **Security (Threshold)** — No exposed secrets, no PII leakage between member tiers, auth boundaries enforced, Supabase RLS policies respected, no SQL injection vectors
2. **Doctrine (Meridian)** — All terminology aligns with NIMS/NQS/FEMA RTLT. Position names match official RTLT entries. Language uses "service"/"serving," never "career"
3. **Accessibility & UX (Lookout)** — Cognitive load minimized. A responder under stress can parse the UI in 3 seconds. Proper ARIA labels, keyboard navigation, color contrast against Command Navy (#0A1628)
4. **Error Handling** — Every async operation has error handling. User-facing errors are clear and actionable. No unhandled promise rejections. No silent failures.
5. **Test Coverage** — New logic has at least one happy-path and one error-path test. If no test framework exists yet, document what should be tested in a `// TODO: test` comment.

**If any check fails, fix it before reporting done.** Do not leave known issues for the next session.

---

## 2. Verification Before Completion

**Iron Law: No completion claims without fresh verification evidence.**

Before claiming ANY status (tests pass, build succeeds, bug fixed, feature works):

1. **IDENTIFY** — What command proves this claim?
2. **RUN** — Execute the full command (fresh, in this session)
3. **READ** — Full output, check exit code, count failures
4. **VERIFY** — Does output confirm the claim?
   - If NO → State actual status with evidence
   - If YES → State claim WITH evidence (paste the output)

**Red flags — STOP if you catch yourself:**
- Using "should pass," "probably works," "seems correct"
- Expressing satisfaction before running verification ("Great!", "Done!")
- About to commit without running the test suite
- Relying on a previous run from earlier in the session

| Claim | Requires | NOT Sufficient |
|-------|----------|----------------|
| "Tests pass" | Test command output showing 0 failures | Previous run, "should pass" |
| "Build succeeds" | Build command exit 0 | Linter passing |
| "Bug fixed" | Reproduce original symptom: now passes | "Code changed, assumed fixed" |
| "Feature works" | Manual or automated verification output | "Looks correct to me" |

**Skip any step = lying, not verifying.**

---

## 3. Systematic Debugging Protocol

**Core principle: ALWAYS find root cause before attempting fixes. Symptom fixes are failure.**

### Phase 1: Root Cause Investigation (MANDATORY before any fix)

1. **Read error messages completely** — stack traces, line numbers, file paths, error codes. Don't skip past them.
2. **Reproduce consistently** — Can you trigger it reliably? What are the exact steps?
3. **Check recent changes** — git diff, recent commits, new deps, config changes
4. **Trace data flow** — Where does the bad value originate? Trace backward through the call stack until you find the source.
5. **In multi-component systems** — Add diagnostic instrumentation at each component boundary BEFORE proposing fixes. Run once to gather evidence showing WHERE it breaks.

### Phase 2: Pattern Analysis

1. Find similar **working** code in the codebase
2. List every difference between working and broken — don't assume "that can't matter"
3. Understand all dependencies and assumptions

### Phase 3: Hypothesis and Testing

1. Form a **single hypothesis**: "I think X is the root cause because Y"
2. Make the **smallest possible change** to test it — one variable at a time
3. Did it work? → Phase 4. Didn't work? → New hypothesis. Do NOT stack fixes.

### Phase 4: Implementation

1. Create a failing test case first (TDD)
2. Implement a single fix addressing root cause
3. Verify the fix (see Section 2)

### The 3-Strike Rule

If your fix doesn't work after 3 attempts:

**STOP. Do not attempt Fix #4.**

3+ failed fixes = you're treating symptoms, not root cause. This often signals an architectural problem. Report:
- What you tried (all 3 attempts)
- What happened each time
- Whether each fix revealed a NEW problem in a DIFFERENT place (architectural signal)
- Your best hypothesis for actual root cause
- What information you'd need to resolve it

**Discuss with ATLAS before proceeding.**

### Red Flags — Return to Phase 1 If You Catch Yourself:
- "Just try changing X and see if it works"
- "Quick fix for now, investigate later"
- "I don't fully understand but this might work"
- Proposing solutions before tracing data flow
- "One more fix attempt" when you've already tried 2+

---

## 4. Safety Guardrails

Hard rules. No exceptions without explicit user approval:

- **Never run destructive commands:** `rm -rf`, `DROP TABLE`, `DROP DATABASE`, `git push --force`, `git reset --hard`, `truncate`, bulk deletes
- **Restrict file edits to your assigned scope.** If the task says "build the auth module," don't reorganize the component library. If you see something that needs fixing outside scope, note it in your completion report.
- **Never modify these files without explicit instruction:**
  - `.env` / `.env.local` (secrets)
  - `package.json` dependencies (unless the task requires new deps)
  - CI/CD workflows (`.github/workflows/`)
  - Database migration files that have already been applied
- **Never widen the blast radius.** Don't refactor adjacent code while debugging. Fix the specific issue. Refactoring is a separate task.
- **When in doubt, ask.** Report what you want to do and why, then wait.

---

## 5. Planning Standard (Standard & Full Tiers)

When writing implementation plans:

**Zero-placeholder rule.** Every step must contain the actual content needed. These are plan failures — never write them:
- "TBD," "TODO," "implement later," "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the content — the implementer may read tasks out of order)
- Steps that describe WHAT without showing HOW

**Every plan step includes:**
- Exact file paths (create/modify/test)
- Complete code in every code step
- Exact commands with expected output
- Bite-sized granularity (one action per step, 2–5 min each)

**Plan structure:**
```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts`
- Test: `tests/exact/path/to/test.ts`

- [ ] Step 1: Write the failing test [code block]
- [ ] Step 2: Run test, verify it fails [command + expected output]
- [ ] Step 3: Write minimal implementation [code block]
- [ ] Step 4: Run test, verify it passes [command + expected output]
- [ ] Step 5: Commit [exact git commands]
```

**Self-review after writing plan:**
1. Spec coverage — every requirement maps to a task
2. Placeholder scan — no red flags from the list above
3. Type/name consistency — names in later tasks match definitions in earlier tasks

---

## 6. Completion Report

Every session ends with this structured report. No exceptions.

```
## Completion Report

### Verification Evidence
- [paste actual test/build output that proves claims below]

### Files Changed
- [list every file created, modified, or deleted]

### Decisions Made
- [any architectural or implementation choices not specified in the task]

### Uncertainties
- [anything you're not confident about, edge cases noticed but not addressed]

### Out-of-Scope Issues Found
- [problems noticed in other files/modules — don't fix, just report]

### Suggested Next Step
- [what should happen next based on what you learned]

### Commit(s)
- [commit hash]: [message]
```

---

## 7. Tiered Engagement

ATLAS selects tier at spawn time. Match process weight to task weight.

| Tier | Task Type | Process |
|------|-----------|---------|
| **Quick** | Typo, config change, one-file edit | Just do it. Self-review gate + verification evidence still apply. |
| **Standard** | Multi-file feature, refactor | Read relevant files. Write plan per Section 5. Build with TDD. Self-review gate. Completion report. |
| **Full** | New feature, new module, design doc execution | Read all referenced docs. Write detailed plan per Section 5. Build incrementally with commits per section. Self-review gate. Completion report. |
| **Investigation** | Bug fix, debugging | Systematic debugging protocol (Section 3). Diagnose first. 3-strike rule. Completion report focused on findings + verification evidence. |

---

## 8. Two-Stage Review (When ATLAS Dispatches Reviewers)

When ATLAS runs post-task review, the session must support two sequential reviews:

**Stage 1 — Spec Compliance Review:**
- Does the code implement what the spec/task asked for? Nothing more, nothing less.
- Missing requirements = not done (implementer fixes, reviewer re-reviews)
- Extra unrequested features = remove them

**Stage 2 — Code Quality Review (only after Stage 1 passes):**
- Code structure, naming, patterns
- Error handling completeness
- Test quality and coverage
- Performance concerns
- Issues categorized: Critical / Important / Suggestion

If either reviewer finds issues → implementer fixes → reviewer re-reviews → repeat until approved.

**Never skip re-review after fixes.** "Close enough" on spec compliance is not acceptable.

---

*These protocols are built from operational failure patterns in AI coding agents — thrashing on bugs, claiming completion without evidence, skipping review, making unsafe changes, and going silent on uncertainty. Adapted from Superpowers (obra/superpowers) systematic debugging, verification-before-completion, and subagent-driven development patterns. Applied to emergency management software where reliability is non-negotiable.*
