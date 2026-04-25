# AGENTS.md

## Project Context

This is a Base44 app built with React, Tailwind, shadcn/ui, lucide-react, and the Base44 platform SDKs.

Codex should prioritize safe, minimal, reviewable changes. This app is complex, so Codex should prefer understanding the structure before making broad changes.

## Base44 Rules

- Do not add new libraries unless explicitly requested.
- Use only libraries supported by the Base44 environment.
- Use `createPageUrl('PageName')` for internal app links.
- Use Entity SDK methods from `@/entities`.
- Use Core integrations from `@/integrations/Core`.
- Do not create custom auth pages; authentication is handled by the platform.
- Preserve existing UX and visual style unless fixing a clear issue.
- Prefer small, focused components over large rewrites.
- Add defensive null checks around data that may be missing.
- Show loading states when fetching data.
- Add empty states for lists, tables, dashboards, and filtered views.
- Avoid broad refactors unless explicitly requested.

## Review Priorities

When reviewing the app, check for:

1. Broken routes or incorrect internal links
2. Entity usage errors
3. Missing loading, empty, or error states
4. Null-safety issues
5. Unsupported libraries or imports
6. Duplicated logic that creates maintenance risk
7. Components that are too large or hard to reason about
8. Security or privacy risks
9. Performance issues caused by unnecessary fetches or renders
10. UX inconsistencies across related pages

## Review Guidelines

When reviewing pull requests, prioritize P0 and P1 issues.

P0 issues include:
- Broken production behavior
- Data loss risk
- Security/privacy risks
- Broken routing or critical user flows
- Changes that violate Base44 platform constraints

P1 issues include:
- Missing loading states that could confuse users
- Missing empty states on important views
- Entity/data handling that may fail with null or missing values
- Shared component changes that could affect multiple pages
- Unsupported imports or patterns

Do not over-prioritize minor style preferences unless they create real usability or maintainability problems.

## Change Behavior

Before changing code:
- Explain the issue
- Identify the affected files
- Recommend the smallest safe fix

When changing code:
- Keep the diff small
- Do not touch unrelated files
- Do not rewrite working sections unnecessarily
- Do not rename files, entities, routes, or data models unless required
- Maintain compatibility with Base44 conventions
- If a task touches more than one major app section, propose a plan first

## Pull Request Expectations

Each PR should include:

- Summary of what changed
- Files changed
- Why the change was needed
- Base44 compliance notes
- Testing or verification performed
- Risks or follow-up work

Prefer draft PRs for Codex-generated work.

## Preferred Workflow

For large or complex requests:

1. First map the relevant pages, components, entities, routes, and integrations.
2. Then create a section-by-section plan.
3. Then audit or fix one section at a time.
4. Avoid combining unrelated fixes into one PR.
# User-provided custom instructions

Prefer safe, minimal, reviewable changes.

For complex apps, first map the relevant pages, components, routes, data models, integrations, and user flows before making broad changes.

Before editing code, explain the issue, the affected files, and the smallest safe fix.

Do not perform broad refactors unless explicitly requested.

Keep PRs focused on one issue or one logical section of the app.

When reviewing code, prioritize:
- correctness
- broken routes or data flow
- security/privacy risks
- missing loading, empty, or error states
- null-safety issues
- maintainability
- unnecessary complexity

If unsure, ask for clarification or propose a plan before changing files.
