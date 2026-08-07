# Dialog

Dialog is Klean UI's native modal primitive for Vue, React, and Svelte. It is one
copied source file around `<dialog>`, not an anatomy tree or a runtime package.

```bash
npx klean-ui add dialog
```

The zero-configuration installer detects the framework and writes one file:

```text
Vue      assets/js/components/ui/dialog/Dialog.vue
React    assets/js/components/ui/dialog/Dialog.jsx
Svelte   assets/js/components/ui/dialog/Dialog.svelte
```

`tailwind-merge` is the only direct dependency. There is no Radix, Base UI,
provider, portal package, focus-trap package, `klean-ui.json`, or generated helper.

## The default API is native HTML

```vue
<Button commandfor="delete-project" command="show-modal">
  Delete project
</Button>

<Dialog id="delete-project" aria-labelledby="delete-project-title">
  <h2 id="delete-project-title" class="text-xl font-semibold">
    Delete this project?
  </h2>
  <p class="mt-2 text-sm text-gray-600">This cannot be undone.</p>

  <form method="dialog" class="mt-6 flex justify-end gap-2">
    <Button type="submit" value="cancel" autofocus>Cancel</Button>
    <Button
      type="submit"
      value="delete"
      class="bg-red-700 hover:bg-red-800 active:bg-red-900"
    >
      Delete project
    </Button>
  </form>
</Dialog>
```

The trigger is a real button. `commandfor` names the dialog and `command="show-modal"`
asks the browser to open it modally. Klean supplies a small fallback for browsers
older than the Invoker Commands API. Buttons in a `method="dialog"` form close the
dialog and set its native `returnValue`.

## What the browser owns

Calling `showModal()` gives the browser responsibility for:

- the top layer and native backdrop;
- modal semantics and inert background content;
- focus entry and containment;
- Escape and platform close requests;
- focus return to the element focused before opening;
- native `cancel`, `close`, `beforetoggle`, and `toggle` events.

Klean does not recreate those behaviors with ARIA, a portal, a focus trap, or global
keyboard listeners. It adds only the gaps that remain useful across current and older
browsers: `closedby` policy, a coordinate-correct backdrop fallback, controlled-state
observation, scroll locking that restores the previous inline value, attribute
forwarding, and class merging.

## Behavior API

| Behavior                   | Vue            | React                   | Svelte        |
| -------------------------- | -------------- | ----------------------- | ------------- |
| Native target              | `id`           | `id`                    | `id`          |
| Controlled state           | `v-model:open` | `open` + `onOpenChange` | `bind:open`   |
| Initial uncontrolled state | `default-open` | `defaultOpen`           | `defaultOpen` |
| Ambient dismissal          | `dismissible`  | `dismissible`           | `dismissible` |
| Styling                    | `class`        | `className`             | `class`       |

State observation is optional. Use it when application logic genuinely needs to know
whether the dialog is open. A basic dialog needs only an `id`, an accessible name,
and a button with the matching native command relationship.

When `dismissible` is `false`, Escape, platform close requests, and backdrop dismissal
are blocked. Explicit completion still works through `close()`, `command="close"`, or
`method="dialog"`. A non-dismissible dialog must always include an explicit,
keyboard-operable completion path.

Vue and Svelte component refs expose `showModal()`, `close(returnValue)`, and
`requestClose(returnValue)`. React forwards the native `HTMLDialogElement`, so the
same methods are already present. Ordinary completion should prefer declarative HTML;
imperative close is useful after an asynchronous action succeeds.

## Accessibility

Every Dialog must have an accessible name:

```html
<dialog aria-labelledby="profile-title">
  <h2 id="profile-title">Edit profile</h2>
</dialog>
```

Use `aria-label` only when there is no visible title. Use `aria-describedby` for a
short, simple description. Do not point it at long structured content such as several
paragraphs, a list, or a table.

Use native `autofocus` to choose initial focus deliberately. For a destructive or
hard-to-reverse action, focus the least destructive action—usually Cancel. For long
content, put `autofocus tabindex="-1"` on a static heading or scrollable content region
so the beginning is not scrolled away.

The native focus return is the default. If a successful action logically moves the
workflow elsewhere, the application may focus that next destination after close.

## Confirmation is a recipe

Klean does not ship `ConfirmDialog`, `DialogTitle`, or `DialogActions`. Those names
hide native markup and quickly become a prop matrix for tone, icon, width, close labels,
and action variants. Write the confirmation content directly, then extract a local
application component if the product repeats it.

Hagfish can use its two-pixel borders, offset shadow, and physical button press.
Slipway can use its quiet operational surface and compact red action. Both use the
same Dialog behavior; their ordinary Tailwind classes remain product-owned.

## Durable UI contract

- open state stays ephemeral unless the dialog is a shareable deep link;
- ambient dismissal works through Escape, platform close, and backdrop;
- `dismissible=false` blocks ambient paths during critical work;
- explicit completion remains available;
- background scroll is restored to its previous value;
- focus entry, containment, and return remain native;
- listeners and scroll state are cleaned up on unmount;
- no component motion is imposed by default.

If a dialog represents a shareable resource such as a photo, preview, or edit route,
the application may synchronize its identity to the URL. Confirmation dialogs remain
ephemeral.

## References

- [HTML `<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API)
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
