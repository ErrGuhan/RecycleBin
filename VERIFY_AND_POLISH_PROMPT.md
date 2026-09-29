# VERIFY AND POLISH PROMPT: Design refinement + full audit

**How to use**
Run this in Antigravity after `BUILD_PROMPT.md` (as Phase 6.5, per its section 11) — or at any later point to audit and refresh a build already in progress. Start a new task in **Planning** mode, make sure `AGENTS.md` and the current `BUILD_PROMPT.md` are in the repo, and paste everything below the line.

---

## 0. Your task

Do two things, in order, and stop for approval before each:

**Part A — Design refinement.** Apply the icon, diagram, typography, spacing, colour and motion system in `BUILD_PROMPT.md` §8 to every screen. §8 is the spec; this document tells you where and how to check it's actually been applied.

**Part B — Verification.** Audit the whole build against `BUILD_PROMPT.md` and `AGENTS.md`, screen by screen and rule by rule, so nothing in the spec was missed and nothing in the code drifted from it. Produce a written report.

Do not add features or change scope beyond what `BUILD_PROMPT.md` §8 already specifies. If you find something the spec should cover but doesn't, log it as a new item under `BUILD_PROMPT.md` §13 (Open questions) rather than deciding it yourself.

Post an **Implementation Plan** for Part A first. Wait for approval, do the work, then post the Part B **Verification Report** (format in section 4 below) before starting Phase 7.

## 1. Ground rules

- Read `AGENTS.md` and `BUILD_PROMPT.md` §8 in full before changing anything. They are the only source of truth for tokens, icons, spacing and motion — don't invent a colour, icon or effect that isn't already there. If the polish pass needs one that's missing, add it to §8 first (in the same PR), then use it.
- This pass must not weaken anything in `AGENTS.md` section 4 (data integrity) or section 5 rule 8-13 (security/privacy) to make a screen look better. If a design idea conflicts with those rules, keep the rule and log the idea as an open question instead.
- Small, reviewable commits. Style/layout changes and logic changes go in separate commits.

## 2. Part A — Apply the design system, screen by screen

For each screen below, apply the icon/diagram placement from `BUILD_PROMPT.md` §8.6 (numbered items) and the motion from §8.7 that applies to it, using the tokens and icon map from §8.2 and §8.5. Then check it off.

| Screen | Icons / diagram (§8.6 item) | Motion (§8.7) |
|---|---|---|
| `/`, `/how-it-works` | 3-step icon row (#1) | — |
| `/rewards` | Plastic-type badges in `--type-*`; tier badges in `--tier-*` with distinct emblem shapes | — |
| `/verify/[no]` | `ShieldCheck`, tier emblem | — |
| `/b/[code]` | `MapPin` for location | Entry-saved checkmark, once signed in |
| `/login`, `/onboarding` | `LogIn`, `User` | Visible focus rings |
| `/home` | Two-icon stat row (#2) + bottle-fill (§8.8) | Stepper press, save checkmark, tier pulse, chip cross-fade |
| `/history` | Status icons (`Clock`/`CheckCircle2`/`XCircle`/`Ban`) | Chip cross-fade |
| `/certificates` | `Award`/`Trophy`, inline stat icons (#6) | New-certificate pulse |
| `/leaderboard` | `Trophy`, `Users` | — |
| `/account` | `Settings`, `ShieldCheck`, `Download` | Toast on save |
| Admin Dashboard | Icon stat tiles + charts (#5) | Skeleton loaders while data loads |
| Admin Verify | Step tracker (#4) + comparison bar (#3) | Bar fills in once, toast on confirm |
| Admin Bins and QR | `MapPin`, `QrCode` | — |
| Admin Students | `Users` | Row hover/selected accent |
| Admin Entries | Status icons + flags | Row hover/selected accent |
| Admin Certificates | `Award` | — |
| Admin Reports | `BarChart3`, `Calendar`, `Download` | — |
| Admin Accounting | Tables stay tables — no forced icons here | — |
| Admin Settings | `Settings` | Toast on save |
| Admin Audit log | `FileText`, `History` | Row hover |
| Every empty state | One icon + one short line (#7) | — |
| `/faq` | `HelpCircle` per question (#8) — text stays text | — |

After each screen, re-check it against `BUILD_PROMPT.md` §8.3-8.4: type scale used (no ad hoc font sizes), tabular numerals on every count/weight/points figure, spacing from the `--space-*` scale only (no bracket-arbitrary Tailwind values), icon-to-label gap and icon size consistent.

## 3. Part B — Verification protocol

Work through these in order. This is the "don't miss anything" pass — be exhaustive, not sampling-based.

1. **Traceability matrix.** Build one row per: every table and field in `BUILD_PROMPT.md` §4, every RPC in §4, every screen in §6, every copy string in §9, every rule in §2-§3, every phase's "Done when" in §11. Columns: `Item | Spec reference | Implemented? | Matches exactly? | Fix applied or open question logged`. Nothing is marked done from memory — check the actual code, schema and rendered screen.
2. **Silent-drop check.** Re-open §13 Open questions. For each one, confirm it is still visible somewhere a human will actually see it — a `[CLIENT TO CONFIRM]` placeholder in the live copy, an item in `docs/setup.md`, or still listed in §13 — not just raised once and forgotten as the build moved on. Report any that quietly disappeared.
3. **Copy fidelity check.** For every string in §9, confirm the app uses it verbatim. Log any deviation and the reason; don't silently reword client-facing copy.
4. **Cross-file consistency check.** Confirm: Settings' live seed values match §3 exactly; every colour in code resolves to a token from §8.2 (grep for hex codes outside `app/globals.css`); every icon import matches §8.5's map; `AGENTS.md` data-integrity and security rules (append-only ledger, snapshot rates, RLS, audit log, service-role key server-only) are all still intact after the polish pass.
5. **Icon/diagram coverage check.** Go down the table in section 2 above and confirm each placement was actually made on the actual screen — not assumed from "the general instruction was applied somewhere."
6. **Spacing/typography lint.** Search for arbitrary Tailwind bracket values (e.g. `p-[13px]`) and hard-coded pixel sizes outside the token file. Each hit is either replaced with a token or justified in the report.
7. **Accessibility re-check.** Contrast test passes for every token pair used, including the new status/type/tier tokens, on every background they appear on. Every status, type and tier distinction has a non-colour cue (icon or emblem shape), not hue alone. `prefers-reduced-motion` is honoured for every item in §8.7.
8. **RLS negative tests still pass** (student A can't read student B's data; anon can only call the public RPCs) — re-run them, don't assume Part A's UI changes left them alone.

## 4. Output: Verification Report

Save as `docs/verification-report-<date>.md` and reference its path in your final reply. Contents:
- Summary table: screen or check × status (✅ / ⚠️ / ❌), one line each.
- Fixes made (bullet list, grouped by screen or area).
- Remaining open items, each cross-referenced to a `BUILD_PROMPT.md` §13 entry (add a new entry if needed rather than leaving something unlisted).
- Updated screenshots for every screen touched, at 390×844 (phone) and 1280×800 (desktop).

## 5. Definition of done

Every row in the traceability matrix is ✅, or is ⚠️/❌ with a specific reason and a linked open question — nothing is silently left unchecked. Typecheck, lint and the full test suite still pass. The report is saved and its path is stated in your reply. Only then move to Phase 7.
