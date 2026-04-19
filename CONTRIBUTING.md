# Contributing to the Crypt

Welcome, traveler.

If you are here, you have looked into the abyss, the abyss looked back, and both of you agreed this codebase needed one more pull request.

This document explains how to contribute without collapsing the timeline.

## Core Doctrine

This project accepts serious code and unserious energy.

What that means in practice:

1. Keep functionality real.
2. Keep tone deranged.
3. Keep code readable.
4. Keep chaos intentional.

If your change makes the app better and the lore funnier, you are among friends.

## Night Laws (Non-Negotiable)

1. No breaking the board.
: Voting, sorting, and character rendering must continue to function.
2. Respect existing faction structure.
: Do not dump characters into random buckets or flatten the taxonomy.
3. Preserve the MILF Council.
: Lisa, Tera, Vampire Tera, and Julia are constitutional entities.
4. No dead links.
: Wiki URLs and image URLs should resolve, or they should not ship.
5. No silent behavior changes.
: If logic changes, describe it clearly in the PR.

## How to Contribute

1. Fork the repository.
2. Create a branch with a clear name.
: Example: `feature/add-nocturne-character` or `fix/vote-sort-order`
3. Make your changes.
4. Run checks before opening a PR.
5. Open a pull request with context.

## Local Ritual

Run the project locally before submitting:

```bash
npm install
npm run dev
```

If you changed behavior, also run:

```bash
npm run lint
npm run build
```

If these fail, the council will know.

## Commit Guidance

Your commit message can be dramatic, but it should still be informative.

Good:
- `feat: add Erzsebet faction badge handling`
- `fix: preserve vote order after local storage hydration`
- `docs: expand README timeline fracture section`

Less good:
- `update stuff`
- `changes`
- `it works now trust me`

## Pull Request Checklist

Before opening a PR, verify all of the following:

- The app runs locally.
- Lint and build pass for your changes.
- New or edited character entries include complete metadata.
- You did not remove lore-critical badges or faction assignments by accident.
- Your PR description explains what changed and why.

## Tribunal Process for Rejected PRs

If a PR is rejected, do not panic.
This is not punishment.
This is theater with actionable feedback.

The tribunal process is:

1. Opening Statement.
: Maintainers describe the issue in plain terms.
2. Evidence Review.
: We inspect failing checks, broken behavior, missing metadata, or lore damage.
3. Remediation Decree.
: You receive clear change requests.
4. Resurrection Attempt.
: You push updates and request re-review.
5. Final Verdict.
: Approved, approved-with-notes, or returned to crypt for another pass.

Appeals are allowed if:
- you can show the rejection reason is outdated
- you have new evidence
- the timeline has shifted due to upstream changes

## Lore Violation Severity Index

All infractions are categorized to keep responses consistent.

Severity I: Cosmetic Disturbance
- typo in flavor text
- minor tone drift
- non-critical documentation weirdness

Severity II: Canon Friction
- inconsistent faction naming
- badge text drift
- unclear or missing character description quality

Severity III: Structural Heresy
- breaking sort order or vote behavior
- shipping incomplete character metadata
- introducing dead wiki or image links

Severity IV: Constitutional Crisis
- removing or corrupting MILF Council entities
- flattening faction architecture without migration plan
- silently changing core ranking logic

Severity V: Apocalyptic Regression
- app does not run
- build or lint is broken by the PR
- major data loss risk or persistent vote corruption

Expected response by severity:

1. Severity I-II.
: Request changes with guidance.
2. Severity III.
: Block merge until fixed.
3. Severity IV-V.
: Immediate hold, escalation, and full re-review after remediation.

## Style Expectations

- Prefer small, focused PRs over giant mystery drops.
- Match existing patterns in TypeScript and React code.
- Keep comments useful and short.
- Avoid refactoring unrelated files unless required.

## Final Oath

By contributing, you acknowledge that this is both:

1. A legitimate web app.
2. A public monument to catastrophic Castlevania attractiveness.

Push responsibly.
Thirst eternally.
