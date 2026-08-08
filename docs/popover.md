# Popover

Popover is Klean UI's non-modal floating surface. It owns durable interaction and positioning while the application owns semantic content and Tailwind appearance.

## Installation

The command is identical for Vue, React, and Svelte:

```bash
npx klean-ui add popover
```

Klean detects the framework, writes one framework-native Popover source file, and installs `@floating-ui/dom` and `tailwind-merge` when missing. There is no initializer, configuration file, provider, Radix, Base UI, or Klean runtime.

## Native relationship

```vue
<Button popovertarget="filters" class="...">Filters</Button>

<Popover id="filters" placement="bottom-start" class="w-72 p-4">
  <section aria-labelledby="filters-title">
    <h2 id="filters-title">Filters</h2>
    <!-- ordinary semantic HTML -->
  </section>
</Popover>
```

`popovertarget` and `id` are native HTML, not Klean configuration. They keep styling honest too: the Button uses its normal `class`, and Popover uses its normal `class`. There is no `PopoverTrigger`, `asChild`, `triggerClass`, prop getter, or attribute-spreading ceremony.

A native button works exactly the same:

```html
<button type="button" popovertarget="filters">Filters</button>
```

The invoker must remain a real button because opening UI is an action, not navigation. Do not use an anchor as a Popover trigger.

## API

| Input                      | Default        | Purpose                                                                                     |
| -------------------------- | -------------- | ------------------------------------------------------------------------------------------- |
| `id`                       | generated      | Native target identifier. Set it when a button invokes the Popover.                         |
| `placement`                | `bottom-start` | Preferred logical placement; may flip or shift to remain visible.                           |
| `offset`                   | `8`            | Pixel distance between the invoker and surface.                                             |
| `open` / framework binding | uncontrolled   | Observe or control open state only when application behavior needs it.                      |
| `defaultOpen`              | `false`        | Initial uncontrolled state, primarily useful for composed UI and tests.                     |
| `class` / `className`      | —              | Ordinary Tailwind classes merged last on the surface.                                       |
| default content            | —              | Ordinary semantic application markup. Receives `open` and `close` in framework-native form. |

Placement and offset are geometry, not visual variants. There are no `variant`, `tone`, `size`, `radius`, `elevation`, or animation props.

## Native close action

The platform can close a Popover declaratively:

```vue
<Button popovertarget="filters" popovertargetaction="hide">Done</Button>
```

The content slot also exposes `close()` for application actions that already run code:

```vue
<Popover id="filters" v-slot="{ close }">
  <Button @click="applyFilters(); close()">Apply</Button>
</Popover>
```

Explicit and Escape dismissal restore focus to the connected invoker. Outside pointer dismissal leaves focus with the element the person selected instead of stealing it back.

Composed controls can pass their active source element when they open the
Popover programmatically. Vue and React expose `open(source)`; Svelte exposes
`show(source)`. The source becomes the placement and focus-return anchor, which
is how Date Picker and Date Range Picker stay attached to the field in use.

## State is observable, not durable

Popover state is ephemeral. Most use needs no state:

```vue
<Button popovertarget="filters">Filters</Button>
<Popover id="filters">...</Popover>
```

Observe it only when another part of the screen genuinely responds:

```vue
<Popover id="filters" v-model:open="filtersOpen">...</Popover>
```

Never persist Popover open state to local storage, session storage, cookies, server data, or the URL. Persist the durable decision inside the surface—such as selected filters—when the product requires it, not the temporary visibility of the surface itself.

## Popover is not Menu or Dialog

- **Popover** is a generic non-modal surface. It leaves content in ordinary document tab order and assigns no role.
- **Menu** will compose Popover with `menu`/`menuitem` semantics, arrow-key navigation, Home/End, and typeahead.
- **Dialog** is modal. It traps focus, makes the background inert, and uses dialog labeling.
- **Tooltip** describes a control on hover/focus and has a different trigger and dismissal contract.

Do not add `role="menu"` merely because a Popover contains several links or buttons. Ordinary lists, navigation, forms, headings, and buttons are often the more truthful semantics.

## Platform and geometry

Modern browsers provide top-layer rendering, light dismissal, Escape, nested Popover behavior, and invoker focus relationships through the native Popover API. Klean keeps a durable JavaScript fallback for older environments.

`@floating-ui/dom` is a geometry engine, not a headless component system. It supplies logical placement, collision flip, viewport shift, and updates during scroll, resize, and layout changes. Klean owns the interaction contract and installs the dependency automatically.

## Hagfish and Slipway extraction

Hagfish repeatedly implements share and more-action surfaces with `onClickOutside`, Escape listeners, IDs, and local open refs. Slipway repeats equivalent plumbing in filter, export, environment, actor, and service controls. Popover replaces that shared behavior. The app-specific markup and Tailwind treatment remain in the app.

Menu-shaped cases are not migrated to generic Popover alone. They will use the Menu component built on this positioning and dismissal foundation so keyboard behavior remains complete.

## Related components

- Button — connect the native invoker with `popovertarget`.
- Menu — add composite semantics for a list of actions and destinations.
- Dialog — use when content must be modal and the background inert.
- Date Picker — a date-only `YYYY-MM-DD` composition built with Calendar and Popover.
- Schedule Picker — a date, time, and timezone composition that commits an exact ISO instant.
