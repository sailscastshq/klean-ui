# Toast

Toast is Klean UI's provider-free notification surface for Vue, React, and Svelte.
It combines one framework renderer with one framework-neutral controller. The
renderer is mounted once near the app root; actions call the controller directly.

```sh
npx klean-ui@latest add toast
```

```js
import { toast } from "@/components/ui/toast/toast.js";

toast("Changes saved");

const id = toast({
  title: "Preparing deployment",
  message: "Reading service configuration",
  duration: false,
});

toast.update(id, {
  title: "Deployment live",
  message: "production.example.com",
  duration: 5000,
});
```

## Doctrine

- One mounted renderer; no provider, plugin, root wrapper, or setup function.
- `toast()` is the ordinary API. `toast.update`, `toast.dismiss`, and
  `toast.clear` cover the lifecycle without inventing another abstraction.
- The default renderer is neutral. Product kinds do not secretly select colours,
  icons, or layouts.
- Tailwind classes and custom content belong to the caller. Arbitrary metadata is
  preserved so a deployment renderer can read progress or status without teaching
  Klean about deployment concepts.
- Durabo supplies the motion feel: 340ms overshooting entry and 300ms exit with a
  small counter-move. Slipway supplies the persistent, updated-in-place deployment
  lifecycle. Hagfish supplies a visual recipe and will inherit the motion when it
  migrates.
- If the platform can own behaviour, Klean lets it. A persistent semantic section,
  list, native buttons, page visibility, focus, animation events, and reduced-motion
  media queries do the work.

## Renderer API

`position` accepts `top-left`, `top-center`, `top-right`, `bottom-left`,
`bottom-center`, or `bottom-right`. The default is `top-right`.

`from` and `to` independently accept `left`, `right`, `top`, `bottom`, `fade`, or
`none`. When omitted, left shelves use `left` and every other shelf uses `right`,
so entry and exit remain on the x-axis. This makes direction change explicit
without a general motion configuration object.

`label` names the live region and defaults to `Notifications`. `class` in Vue and
Svelte, or `className` in React, styles the viewport. Each notification's `class`
or `className` styles its surface after Klean's neutral defaults.

Pass custom content through Vue's scoped slot, React's function child, or Svelte's
snippet. Each receives `{ item, dismiss }`.

## Controller API

`toast(message, options?)` and `toast(item)` return an id. Items accept ordinary
`title`, `message`, `duration`, `dismissible`, `dismissLabel`, `class`, and
application-specific data. `duration: false` keeps an item until it is updated or
dismissed.

- `toast.update(id, patch)` updates the same notification.
- `toast.dismiss(id)` begins its exit motion.
- `toast.clear()` dismisses every notification.
- `createToast({ duration, max })` creates an isolated controller when a surface
  genuinely needs its own stack.

The default duration is 5000ms and the default live stack is four notifications.
Expired notifications preserve exit motion before removal. Time remaining pauses
on hover, focus, document visibility loss, and window blur. Pause reasons compose.

## Accessibility

The mounted renderer is a persistent labelled `<section aria-live="polite">` with
an ordered list of atomic items. It never moves focus. The close affordance is a
native button with an accessible name. Keyboard focus pauses expiry. Reduced-motion
preferences collapse entry and exit to 1ms and remove list movement.

Mount `Toast` before issuing the first notification so assistive technology can
observe additions. Do not use toast for errors that must remain beside a form field
or for decisions that require a dialog.
