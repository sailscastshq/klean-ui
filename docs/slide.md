# Slide

Slide is an action-confirmation button for Vue, React, and Svelte. Pointer users
may drag and release beyond the conventional 85% threshold; Enter, Space, and
assistive activation use the same native button action.

```sh
npx klean-ui@latest add slide
```

The zero-configuration installer detects the framework and writes one source file:

```text
Vue      assets/js/components/ui/slide/Slide.vue
React    assets/js/components/ui/slide/Slide.jsx
Svelte   assets/js/components/ui/slide/Slide.svelte
```

`tailwind-merge` is the only direct dependency. There is no Klean runtime,
initializer, configuration file, provider, alias prompt, generated helper, or
interaction dependency.

## API

```vue
<Slide
  :disabled="!ready"
  :pending="deploying"
  class="w-72"
  aria-describedby="deploy-help"
  @confirm="deploy"
>
  {{ deploying ? 'Sliding to production…' : 'Slide to production' }}
</Slide>
```

The public contract is `disabled`, `pending`, one framework-native confirmation
event, default content, and ordinary button attributes/classes. React uses
`onConfirm` and `className`; Svelte uses `onconfirm` and `class`.

`pending` belongs to the application. Set it before starting asynchronous work and
return it to `false` on success or failure. Pending prevents duplicate confirmation,
sets `aria-busy`, preserves the caller's current label, and resets declaratively.
There is no imperative `reset()` method.

## Why this is a button

Slide confirms an action; it does not choose a value. It renders a real
`<button type="button">`, not an input with slider semantics. Sliding is a pointer
enhancement for mouse, touch, and pen, never the only activation path. A future
range-value component will be named Slider and keep native slider semantics.

## Tailwind owns product color

The default is neutral monochrome. The root exposes
`data-progress="start|middle|ready|complete"`; the internal fill and thumb expose
`data-slot="slide-fill"` and `data-slot="slide-thumb"`. Applications can use
ordinary Tailwind arbitrary selectors to recolor progress:

```vue
<Slide
  class="
    [&_[data-slot=slide-fill]]:bg-amber-500/10
    [&[data-progress=middle]_[data-slot=slide-thumb]]:bg-amber-500
    [&[data-progress=ready]_[data-slot=slide-thumb]]:bg-emerald-500
    [&[data-progress=ready]_[data-slot=slide-fill]]:bg-emerald-500/10
  "
  @confirm="deploy"
>
  Slide to production
</Slide>
```

There are no variants, tones, color props, part-class props, hidden Klean utilities,
or theme provider. Repeated product treatment belongs in an application component.

## Durable UI contract

- release before the threshold, Escape, pointer cancellation, and lost capture reset
  without confirmation;
- disabled and pending states cannot emit twice;
- focus remains on the native button through cancellation, confirmation, failure,
  and reset;
- measured geometry responds to track/thumb resizing and logical RTL direction;
- reduced-motion preferences remove transitions without hiding progress;
- position, visible text, and polite status—not color alone—communicate state;
- drag progress stays ephemeral and is never stored in browser, URL, cookie, or
  server state;
- pointer capture, observers, and component-owned work are cleaned up on unmount.
