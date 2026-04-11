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

## 2. Investigation Protocol

When debugging or fixing a bug:

- **Diagnose before fixing.** Read the error, trace the data flow, form a hypothesis. Do not change code until you understand the failure.
- **3-strike rule.** If your fix doesn't work after 3 attempts, STOP. Report what you know:
  - What you tried
  - What happened
  - Your best hypothesis for root cause
  - What information you'd need to resolve it
- **Never widen the blast radius.** Don't refactor adjacent code while debugging. Fix the specific issue. Refactoring is a separate task.

---

## 3. Safety Guardrails

These are hard rules. No exceptions without explicit user approval:

- **Never run destructive commands:** `rm -rf`, `DROP TABLE`, `DROP DATABASE`, `git push --force`, `git reset --hard`, `truncate`, bulk deletes
- **Restrict file edits to your assigned scope.** If the task says "build the auth module," don't reorganize the component library. If you see something that needs fixing outside scope, note it in your completion report.
- **Never modify these files without explicit instruction:**
  - `.env` / `.env.local` (secrets)
  - `package.json` dependencies (unless the task requires new deps)
  - CI/CD workflows (`.github/workflows/`)
  - Database migration files that have already been applied
- **When in doubt, ask.** Report what you want to do and why, then wait.

---

## 4. Completion Report

Every session ends with this structured report. No exceptions.

```
## Completion Report

### Files Changed
- [list every file created, modified, or deleted]

### Decisions Made
- [any architectural or implementation choices you made that weren't specified in the task]

### Uncertainties
- [anything you're not confident about, edge cases you noticed but didn't address]

### Out-of-Scope Issues Found
- [problems you noticed in other files/modules — don't fix, just report]

### Suggested Next Step
- [what should happen next based on what you learned during this session]

### Commit(s)
- [commit hash]: [message]
```

---

## 5. Tiered Engagement

Match your process to the task weight. ATLAS selects the tier at spawn time.

| Tier | Task Type | Process |
|------|-----------|---------|
| **Quick** | Typo, config change, one-file edit | Just do it. Self-review gate still applies. |
| **Standard** | Multi-file feature, refactor | Read relevant files first. Write a 3-line plan (what, which files, risk). Build. Self-review gate. Completion report. |
| **Full** | New feature, new module, design doc execution | Read all referenced docs. Write a detailed plan. Build incrementally with commits per section. Self-review gate. Completion report. |
| **Investigation** | Bug fix, debugging | Investigation protocol. Diagnose first. 3-strike rule. Completion report focused on findings. |

---

*These protocols are extracted from operational discipline principles and adapted for emergency management software development. They exist because AI coding agents fail in predictable ways — thrashing on bugs, making unsafe changes, skipping review, and going silent on completion. This document prevents those failures.*
