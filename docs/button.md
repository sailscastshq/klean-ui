# Button

Button is a native-first action primitive. It owns element selection, safe button type, disabled semantics, attribute forwarding, a stable `data-slot`, and class composition. It does not own business loading state, confirmation, navigation routing, or a catalog of visual variants.

Its appearance may look button-like while its rendered element follows the job. Actions are buttons. Navigation is an anchor or the Boring Stack Link. Klean never recommends wrapping one interactive element inside another.

## Installation

The command is identical for Vue, React, and Svelte:

```bash
npx klean-ui add button
```

Klean detects the application framework and writes only `Button.vue`, `Button.jsx`, or `Button.svelte` to `assets/js/components/ui/button/`. No initializer, framework prompt, configuration file, or Klean runtime package is required.

## API

| Input                 | Default    | Purpose                                                                                |
| --------------------- | ---------- | -------------------------------------------------------------------------------------- |
| `as`                  | `'button'` | Render a native `button`, native `a`, or a framework component such as Inertia `Link`. |
| `type`                | `'button'` | Preserve safe button behavior; accepts `button`, `submit`, or `reset`.                 |
| `disabled`            | `false`    | Uses native disabled behavior for buttons and accessible disabled semantics for links. |
| `class` / `className` | —          | The visual API. Caller Tailwind classes merge last.                                    |
| default slot          | —          | Label, icon, Spinner, or any other accessible button content.                          |

There are intentionally no `variant`, `size`, `color`, `tone`, `radius`, `elevated`, or `loading` props.

## Choose the semantic element

| Job                                           | Klean usage                            | Rendered semantics            |
| --------------------------------------------- | -------------------------------------- | ----------------------------- |
| Open UI, change local state, or run an action | `<Button type="button">`               | `<button type="button">`      |
| Submit a form                                 | `<Button type="submit">`               | `<button type="submit">`      |
| Internal Boring Stack navigation              | `<Button :as="Link" href="/projects">` | Inertia's anchor-based `Link` |
| External URL, OAuth redirect, or download     | `<Button as="a" href="…">`             | `<a>`                         |

Do not do this:

```vue
<a href="/pricing">
  <Button>View pricing</Button>
</a>
```

Nested interactive elements create invalid, confusing interaction. Render one truthful element instead:

```vue
<Button as="a" href="/pricing">View pricing</Button>
```

## Form action

```vue
<Button type="submit" :disabled="form.processing">
  <Spinner v-if="form.processing" aria-hidden="true" />
  {{ form.processing ? 'Saving' : 'Save changes' }}
</Button>
```

Use `aria-busy="true"` while processing. Keep the visible label meaningful and disable duplicate submissions in the owning form.

## Inertia navigation

```vue
<script setup>
import { Link } from "@inertiajs/vue3";
import Button from "@/components/ui/button/Button.vue";
</script>

<template>
  <Button :as="Link" href="/projects/new">New project</Button>
</template>
```

Passing the component keeps Inertia outside the base primitive while retaining link semantics. A disabled non-button receives `aria-disabled="true"`, leaves the tab order, and blocks activation.

Use Inertia `Link` for normal internal GET navigation. Use a native anchor when the browser must perform a full document request, including external destinations, OAuth redirects, and downloads.

## Native anchor

```vue
<Button as="a" href="https://sailsjs.com" target="_blank" rel="noreferrer">
  Read the Sails documentation
</Button>
```

The `href`, `target`, `rel`, `download`, `aria-*`, and `data-*` attributes pass through normally.

## Visual recipes

Recipes belong to the app. They may be constants, local wrappers, or direct classes, depending on how often they repeat.

```vue
<!-- Hagfish: expressive -->
<Button
  class="border-2 border-black bg-black px-6 text-white hover:bg-white hover:text-black hover:shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
>
  Send invoice
</Button>

<!-- Slipway: compact desktop control -->
<Button class="min-h-9 min-w-0 rounded-md px-3 py-1.5 text-sm">
  Deploy
</Button>
```

The compact recipe is for dense desktop surfaces. Keep the default 44px target for touch-first layouts.

The Hagfish translation is deliberately application-owned. The Klean default and the Slipway recipe do not move on press; they use tonal feedback. Add `active:` transform classes only when physical motion belongs to the application's design language.

## Everyday source-app recipes

The Hagfish and Slipway audit gives Button a wider proving surface than primary and secondary CTAs.

### Icon-only action

```vue
<Button
  type="button"
  aria-label="Refresh deployments"
  class="min-h-9 min-w-9 px-0 py-0"
>
  <RefreshIcon aria-hidden="true" class="h-4 w-4" />
</Button>
```

The 36px recipe belongs to dense desktop tooling. Use the default 44px target on touch-first surfaces.

### Pressed action

```vue
<Button
  type="button"
  :aria-pressed="sidebarVisible"
  @click="sidebarVisible = !sidebarVisible"
>
  Sidebar
</Button>
```

`aria-pressed` is native button state. It does not require a Klean prop.

### Quiet destructive action

```vue
<Button
  type="button"
  class="min-h-0 min-w-0 bg-transparent px-0 py-0 text-red-700 hover:bg-transparent hover:text-red-800"
>
  Stop recurring invoices
</Button>
```

Clear wording communicates the action. Tailwind communicates its product treatment. A `danger` prop is unnecessary.

## Hagfish and Slipway audit

Hagfish currently proves:

- full-width authentication and form submits with processing labels;
- application-owned primary and secondary treatments;
- dialog confirmation and cancellation actions;
- text actions and icon-only controls;
- internal Inertia navigation and external payment-provider links;
- expressive light/dark interaction with offset shadows.

Its existing `BaseButton` confirms the usefulness of one semantic root, caller class merging, safe types, anchors, Inertia Link, and disabled non-button behavior. Its `PrimaryButton` and `SecondaryButton` also show what Klean should remove from the primitive: visual `size` and `color` props. Existing anchor-wrapped button components should become a single Button rendered as `a` or `Link`.

Slipway currently proves:

- 48px form submits with processing content;
- compact 32px and 36px operational controls;
- icon-only toolbar actions;
- pressed controls, tab triggers, menu items, and compound actions;
- destructive text and filled actions;
- links styled as controls throughout dense project tooling;
- extensive light/dark inversion.

Not every Slipway button is only a Button concern. Tabs, menus, and compound widgets need their parent accessibility contract as well. Klean Button supplies the truthful interactive element, focus, disabled semantics, attributes, slots, and class ownership; the composed component supplies roving focus, selection relationships, or menu behavior.

## Accessibility contract

- The default is a real `button` with `type="button"`.
- Submit and reset behavior remain native.
- Icon-only usage requires an accessible name such as `aria-label`.
- Focus is visible without relying on color alone.
- Disabled non-buttons are non-focusable and non-activatable.
- Processing indicators are decorative when the visible label already describes the state.
- Motion is removed when the user prefers reduced motion.

This is the registry contract for Button. Hagfish and Slipway continue to prove application-owned recipes without expanding the primitive into a visual variant API.

## Related components

- Popover — connect Button with native `popovertarget` when it opens non-modal content.
- Menu — use when a Button opens a keyboard-navigable list of actions or destinations.
- Dialog — use when the action opens a modal task or confirmation.
- Slide — reserve for consequential actions that benefit from deliberate pointer confirmation.
