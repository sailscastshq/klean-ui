---
name: klean-ui
description: Build, customize, migrate, or review Klean UI in Boring Stack applications using source-owned Vue, React, or Svelte components, caller-owned Tailwind styling, accessible native semantics, and Durable UI behavior.
---

# Klean UI

Klean means Kelvin's Lean UI. It is the source-owned implementation of Durable
UI for The Boring JavaScript Stack. Preserve the application's identity while
making its behavior accessible, resilient, and unsurprising.

## Work the Klean way

1. Inspect the application before changing it. Identify its framework,
   conventional component directory, existing Klean source, product styling,
   and the real interaction being replaced.
2. Choose the smallest semantic primitive that fits. Actions are buttons;
   navigation is a native anchor or the application's Link component. Prefer a
   browser capability when the platform already provides the behavior.
3. Add only the source that the application needs:

   ```bash
   npx klean-ui add button --dry-run
   npx klean-ui add button
   ```

   Klean detects conventional Boring Stack Vue, React, and Svelte applications.
   Do not introduce an initializer, `klean-ui.json`, alias questionnaire,
   generated `cn.js`, provider, or Klean runtime.
4. Treat installed source as an editable behavioral and accessibility baseline.
   Style it at the call site with ordinary Tailwind classes. Caller classes must
   win.
5. Keep visual vocabulary in the application. Do not add `variant`, `tone`,
   `size`, color, radius, or theme-object APIs to Klean primitives. When a visual
   treatment repeats, create an application-owned component composed from the
   primitive. Do not invent Klean-only Tailwind utilities.
6. Keep framework implementations idiomatic. Do not create a cross-framework
   runtime abstraction merely to make Vue, React, and Svelte source look alike.

## Use Klean Icons as application-owned source

Install only the semantic icons the feature needs, as one atomic collection:

```bash
npx klean-ui add icon trash search calendar
```

Use the installed component's semantic name, such as `Trash`, rather than an
`Icon`-suffixed alias such as `TrashIcon`, and import it directly from the
application-owned icon directory. Do not introduce an icon runtime or global
library import.

Klean Icons inherit `currentColor` and accept ordinary classes and SVG
attributes. Size and color them at the call site. Preserve the default 24px
canvas, calm 1.5px stroke, and rounded joins unless the application has a
deliberate reason to adjust the presentation.

The SVG is decorative by default. Put the accessible name on the surrounding
button, link, label, or text instead of making assistive technology announce
the glyph. When an icon conveys a standalone status, pair it with meaningful
application text.

Choose icons by meaning rather than visual resemblance. Consult the live
[Klean Icons catalog](https://docs.sailscasts.com/klean-ui/components/icons)
instead of duplicating the evolving icon list in this skill.

## Make behavior durable where it matters

Durability is a product decision, not a wrapper around every primitive. Keep
state with the feature that owns it and choose the browser surface that matches
the user's expectation:

- Use the URL for navigable, shareable, or refresh-stable state such as filters,
  search, tabs, pagination, and selected records.
- Restore drafts and multi-step progress when losing them would cost meaningful
  work.
- Restore scroll when returning to a long surface.
- Cancel stale asynchronous work and roll optimistic changes back on failure.
- Preserve focus, dismissal, keyboard behavior, reduced motion, and useful
  announcements across overlays and notifications.

Use `npx klean-ui add durable-ui` when the application needs Klean's
framework-native persistence utilities. Do not add persistence simply because
it is available.

## Preserve application identity

When migrating an existing screen, use the running application and its source
as the visual reference. Klean must be able to power both restrained,
operational interfaces such as Slipway and expressive interfaces such as
Hagfish without turning either into a theme.

- Preserve intended layout, density, type, color, responsive behavior, and
  motion unless the user requests a redesign.
- Replace behavior and markup without accepting visual regression.
- Test narrow and wide layouts. Overlay placement must survive viewport edges,
  scrolling containers, and the actual application shell.
- Do not copy a Storybook recipe into an application without checking the real
  product treatment.

## Keep accessibility inside the contract

Use semantic elements and native attributes first. Verify accessible names,
label and error relationships, keyboard operation, visible focus, disabled
semantics, focus return, escape/dismiss behavior, reduced motion, and status
announcements as applicable. Do not expose ARIA trivia as a convenience API
when ordinary HTML expresses the relationship more clearly.

## Update owned source safely

The source belongs to the application, so inspect before writing:

```bash
npx klean-ui check
npx klean-ui diff button
npx klean-ui update button
npx klean-ui update --all
```

Never overwrite locally edited or unknown source automatically. Review the
diff and preserve application changes. Use `--overwrite` only when the user has
explicitly chosen replacement after seeing what will be lost.

## Dependencies and verification

Do not add PrimeVue, Volt, Radix, Base UI, or another primitive library when the
platform or Klean already supplies the required contract. A focused dependency
is acceptable when it solves a genuinely difficult capability; keep it behind
owned source and explain why it is needed.

Verify behavior in proportion to the change. For Klean registry work, exercise
the real component in Vue, React, and Svelte, run relevant interaction and
accessibility checks, and confirm canonical Tailwind classes. For application
migrations, test the application's actual workflow and compare it with the
existing UI.

The canonical and current API documentation is
[docs.sailscasts.com/klean-ui](https://docs.sailscasts.com/klean-ui/). Read the
relevant component page and its related-components guidance rather than
guessing an API from another library.
