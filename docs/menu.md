# Menu

Menu is Klean UI's accessible list of actions and navigation destinations. It composes Klean Popover for native top-layer display, light dismissal, focus return, and collision-aware positioning, then adds the menu interaction contract: roles, one roving focus stop, Arrow keys, Home/End, printable-key typeahead, disabled-item handling, selection, and predictable cleanup.

## Installation

The command is identical for Vue, React, and Svelte:

```bash
npx klean-ui add menu
```

Klean detects the framework, writes its framework-native `Menu` source, and installs `Popover` first when it is missing. Popover brings the focused geometry and class-merging dependencies. There is no initializer, configuration file, provider, trigger component, Radix, Base UI, Headless UI, or Klean runtime.

## The complete Vue API

```vue
<Button popovertarget="project-actions">
  Actions
</Button>

<Menu id="project-actions" aria-label="Project actions" class="w-56">
  <button
    type="button"
    class="flex w-full cursor-pointer rounded px-3 py-2 text-left text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
  >
    Redeploy
  </button>
  <a
    href="/deployments"
    class="flex w-full rounded px-3 py-2 text-sm no-underline outline-none hover:bg-gray-100 focus:bg-gray-100"
  >
    View deployments
  </a>
</Menu>
```

That is the API. The invoker is any real button with native `popovertarget`. Native buttons and anchors inside Menu become menu items automatically. Klean adds the necessary composite semantics and tab stops; the application does not import `MenuTrigger`, `MenuItem`, an attribute getter, or a class helper.

React uses `className`; Svelte uses `class`. Their HTML relationship and behavior are the same.

## Truthful items

Use a button when selection performs an action:

```vue
<button type="button" class="cursor-pointer ..." @click="redeploy">Redeploy</button>
```

Use a native anchor for a destination that performs document navigation:

```vue
<a href="/deployments" class="...">View deployments</a>
```

Use the Boring Stack Link for internal Inertia navigation without changing the element contract:

```vue
<Link href="/projects/42/settings" class="...">Project settings</Link>
```

Menu does not accept an item-data array because arrays encourage the component to guess whether each record should render a button, anchor, or framework link. Visible elements keep authorization, conditions, event handlers, and application state where developers can read them.

## Disabled items

A disabled action uses the native attribute:

```vue
<button type="button" disabled class="disabled:cursor-not-allowed disabled:opacity-40">
  Stop provisioning
</button>
```

If a navigation item must remain visible while unavailable, use `aria-disabled="true"`, style that state, and omit navigation when practical. Menu prevents activation and skips it during roving focus:

```vue
<a
  href="/rollback"
  aria-disabled="true"
  class="aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
>
  Roll back
</a>
```

Hiding an unauthorized item remains application logic. Menu does not own permissions.

## Keyboard and focus contract

- Click, Enter, or Space on the real trigger opens the menu and focuses the first enabled item.
- Arrow Down on the trigger opens at the first enabled item; Arrow Up opens at the last.
- Arrow Down and Arrow Up wrap between enabled items.
- Home and End move to the first and last enabled items.
- Printable characters use a short buffered typeahead against visible text or `aria-label`.
- Native Enter and Space activation remain owned by the real button or anchor, avoiding double firing.
- Escape closes and restores focus to the invoker.
- Selection closes and restores focus; link navigation may then move to the destination.
- Tab or Shift+Tab closes and continues to the next or previous control outside the menu; neither key moves between menu items.
- Outside interaction closes without stealing focus from the thing the person selected.

Menu has no animation. Applications can add motion with ordinary Tailwind classes when it adds value, and must use `motion-safe:` or a reduced-motion fallback.

## API

| Input                      | Default        | Purpose                                                                |
| -------------------------- | -------------- | ---------------------------------------------------------------------- |
| `id`                       | generated      | Native target identifier. Set it when a button invokes the Menu.       |
| `placement`                | `bottom-start` | Preferred logical placement; may flip or shift to remain visible.      |
| `offset`                   | `8`            | Pixel distance between the invoker and surface.                        |
| `open` / framework binding | uncontrolled   | Observe or control visibility only when application behavior needs it. |
| `defaultOpen`              | `false`        | Initial uncontrolled visibility, mainly useful in examples and tests.  |
| `class` / `className`      | —              | Ordinary Tailwind classes merged last on the menu surface.             |
| default content            | —              | Native buttons, anchors, or framework links.                           |

Placement and offset are geometry, not visual variants. There are no `variant`, `tone`, `size`, `inset`, `destructive`, animation, or theme props. Style a destructive item red in its own class. If a product treatment repeats, create an application component or class constant with a product name.

## Menu is not every floating list

- **Menu** is a composite widget of actions and destinations with arrow navigation and typeahead.
- **Popover** contains ordinary content such as forms, filters, help, or previews and leaves it in normal Tab order.
- **Select** chooses a value and needs a distinct selected-option contract.
- **Combobox** combines text input, filtering, and an option popup.
- **Dialog** is modal, traps focus, and makes the background inert.

Do not add `role="menu"` to site navigation merely because its links appear in a floating surface. Website navigation remains a semantic `nav` and list of links with ordinary Tab behavior.

## Hagfish and Slipway extraction

Slipway's `ActionMenu.vue` already proves the need for buttons, Boring Stack links, disabled actions, destructive caller styling, Arrow keys, Escape, and focus return. Klean removes its repeated open ref, outside listener, absolute positioning, trigger wiring, and keyboard loop. Slipway keeps its compact gray classes.

Hagfish's PrimeVue Menu wrapper proves a more expressive treatment and link/action mixture, but currently carries pass-through theme anatomy and a second component runtime. Klean replaces that surface with readable local source while Hagfish keeps its strong border, offset shadow, type, and spacing classes.

Both products use the same Menu behavior. Neither selects a theme or visual variant.

## Durable state boundary

Menu visibility is ephemeral and is never stored in local storage, session storage, cookies, server data, or the URL. Persist the durable decision selected from a menu—such as a filter mode—only when the product needs it. Every listener, observer, and typeahead timer is scoped to a mounted Menu and removed on cleanup.
