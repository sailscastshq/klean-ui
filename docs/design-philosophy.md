# Klean UI design philosophy

Klean UI means Kelvin's Lean UI. It is the source-owned UI system for The Boring JavaScript Stack: a small amount of excellent markup, durable behavior, and accessibility that then gets out of the way. Klean is also the canonical implementation of our Durable UI practice.

The promise is simple:

> Own the source. Keep the markup. Style it with Tailwind.

Klean is deliberately boring in the best sense. A component should be understandable in one reading, editable without library archaeology, and calm enough to carry the visual language of many products. Vue, React, and Svelte are equal product targets, each expressed as framework-native source.

## The non-negotiables

Every Klean component follows these rules:

1. **The application owns the source.** Klean installs local files, not a vendor-controlled runtime abstraction.
2. **Conventions are the configuration.** A standard Boring Stack app needs no initializer, `klean-ui.json`, alias questionnaire, or generated helper.
3. **HTML provides the starting contract.** Native elements and browser behavior come before custom abstractions.
4. **Tailwind is the visual API.** Visual choices belong in `class`, not in component props.
5. **There are no visual variants.** Klean does not ship `variant`, `size`, `tone`, `color`, `radius`, or `elevation` APIs.
6. **Props must earn their place through behavior or semantics.** A prop is not an indirect spelling of a CSS class.
7. **Accessibility is a release gate.** A component is unfinished when its keyboard, focus, naming, state, or assistive-technology behavior is unfinished.
8. **Application classes win.** Defaults stay low-specificity and caller classes are merged last.
9. **Anatomy stays obvious.** Slots, parts, state, and rendered elements should be visible in the source.
10. **Real applications settle the design.** Hagfish and Slipway are proving grounds, not themes to average together.
11. **Durability is part of correctness.** Appropriate state survives, navigation context is shareable, overlays dismiss predictably, focus recovers, and failed optimistic work rolls back.

These are contributor constraints, not suggestions. A convenient feature that breaks them is not a Klean feature.

## What "lean" means

Lean does not mean unstyled, inaccessible, or incomplete. It means that Klean owns only the layer it can own well.

Klean owns:

- sound semantic markup;
- accessible behavior and state;
- Durable UI components and composables with resilient defaults;
- useful neutral defaults;
- clear slots and `data-*` hooks;
- safe attribute forwarding;
- Boring Stack usage guidance;
- readable source that can be changed locally.

The application owns:

- brand color and product tone;
- density, radius, shadow, and typography choices;
- names such as `PrimaryButton` or `DeleteProjectButton`;
- business state and server interaction;
- the final composition of primitives into product UI.

That boundary is what keeps Klean useful after the demo.

## Source ownership and zero configuration

The primary consumption model is copied source:

```bash
npx klean-ui add button
```

In a conventional Boring Stack application, Klean should infer the framework, Tailwind, source aliases, component paths, and dependency placement from the stack's conventions. There is no required `init` step and no project manifest to maintain before the first component can be added.

Configuration remains possible only as an escape hatch for a nonstandard project. It must never become ceremony imposed on the standard path.

Once installed, `Button.vue`, `Button.jsx`, or `Button.svelte` is application code. A developer can read it, edit it, rename it, or stop receiving changes. Klean reports a conflict when a local file differs; it does not pretend to retain ownership or overwrite the application automatically.

## Native HTML first

Klean begins with the platform. A button begins as `<button>`, navigation remains a link, labels are real `<label>` elements, related choices use `<fieldset>` and `<legend>`, and headings describe the document instead of acting as font-size shortcuts.

The same rule applies to newer platform capabilities. Dialog begins as `<dialog>` and uses `showModal()`, `command`/`commandfor`, `closedby`, native toggle events, and native focus behavior before Klean adds framework code. Toast begins as one persistent semantic section and list, uses the platform's live-region, focus, page-visibility, animation-event, and reduced-motion contracts, then adds only the bounded controller the platform does not provide. Browser support determines the small fallback boundary; familiarity with an older component library does not.

This creates three useful properties:

- expected browser behavior works before JavaScript enhancement;
- native attributes pass through without a parallel Klean vocabulary;
- the source remains recognizable to any web developer.

Custom markup is justified only when native HTML cannot satisfy the interaction contract. Even then, Klean should preserve the closest correct semantics and make the extra behavior easy to inspect.

## Tailwind is the visual API

Klean does not translate styling choices into props.

Do not build this API:

```vue
<Button variant="primary" size="large" tone="danger" radius="full" elevated>
  Delete project
</Button>
```

Write the design directly:

```vue
<Button
  class="min-h-11 rounded-md bg-red-700 px-5 py-2.5 font-semibold text-white hover:bg-red-800"
>
  Delete project
</Button>
```

This is not an escape hatch around the component API. It **is** the component's visual API.

The same rule applies to conditional styles. Use Vue's native class syntax:

```vue
<Button
  :disabled="form.processing"
  :class="[
    'min-h-11 px-5 py-2.5 font-semibold',
    form.processing ? 'cursor-wait opacity-70' : 'hover:bg-zinc-800',
  ]"
>
  {{ form.processing ? 'Saving changes' : 'Save changes' }}
</Button>
```

Klean does not generate or publicly expose a `cn.js` helper. Use the framework's ordinary class API: `class` in Vue and Svelte, `className` in React, with their native conditional composition. If a component needs internal conflict-aware merging, that is an implementation detail inside the copied source—not a new concept every application must import.

### Motion belongs to the product

Controls do not move, scale, bounce, or depress merely because they were activated. Their defaults use quiet tonal feedback and a visible focus indicator. Product decoration remains a Tailwind choice, not a personality Klean imposes on every application.

Motion may be part of a component's actual interaction contract when it explains a state transition: a notification entering or leaving the viewport is the first such case. Toast therefore ships a restrained, tested default derived from Durabo, exposes only entry and exit direction, and collapses movement for `prefers-reduced-motion`. That is structural feedback, not a visual variant system.

Hagfish can keep its offset-shadow press because that motion is part of Hagfish's visual language. Slipway can remain still because its dense operational controls rely on color changes. Both treatments use the same semantic Button.

### Repetition becomes an application component

When a visual recipe repeats, give that product concept a local name:

```vue
<!-- assets/js/components/PrimaryButton.vue -->
<script setup>
import Button from "@/components/ui/button/Button.vue";
</script>

<template>
  <Button
    class="min-h-11 rounded-md bg-zinc-950 px-5 py-2.5 font-semibold text-white hover:bg-zinc-800"
  >
    <slot />
  </Button>
</template>
```

`PrimaryButton` is allowed to be opinionated because it belongs to one product. The Klean registry should not convert that opinion into a universal `variant="primary"` contract.

Prefer a named wrapper when the name expresses recurring product intent. Prefer direct Tailwind classes when the styling is local. Prefer a shared class constant only when it makes the surrounding template clearer. None of these patterns require a variant engine.

## No variants means no variants

Klean does not ship a hidden variant system under a different name. Avoid:

- `appearance`, `kind`, `intent`, or `preset` props that only choose classes;
- exported `buttonVariants()` functions;
- a registry of visual recipes pretending to be component behavior;
- compound-variant configuration;
- theme props that reproduce Tailwind utilities.

A prop named `intent="danger"` is still a visual variant when all it does is choose red classes. Danger should be expressed by application classes, product composition, and clear wording. If a prop changes actual interaction semantics, it must be named for that behavior and documented as such.

## Behavior earns props

A small public API is a design result, not a component-counting game. Each prop must answer: **what behavior or semantic contract does this add that native attributes, slots, or classes cannot express clearly?**

| Belongs in the API            | Does not belong in the API |
| ----------------------------- | -------------------------- |
| rendered element or component | color                      |
| controlled open state         | visual tone                |
| value and checked state       | size preset                |
| disabled semantics            | radius                     |
| form behavior                 | shadow or elevation        |
| accessible relationships      | layout width               |

Native attributes should normally remain native attributes. Klean should not invent `isRequired` when `required` already exists or `labelFor` when `for` already communicates the relationship.

Loading is owned by the application unless a richer component has a genuine reusable loading behavior. A Button should accept `disabled`, `aria-busy`, and slot content; it should not guess the label, spinner, request lifecycle, or whether the previous label must remain visible.

## Class ownership

Every component must make styling predictable:

- use low-specificity Tailwind utilities;
- merge caller classes after defaults;
- avoid inline styles that trap overrides;
- avoid `!important` except for a documented platform defect;
- expose stable `data-slot` names for meaningful parts;
- expose behavior state through native attributes or documented `data-*` attributes;
- do not require consumers to know private DOM depth for routine styling.

Defaults should make an isolated component usable and accessible. They are a starting point, not a brand that fights to survive application classes.

## Obvious anatomy

Klean source should read like the interface it produces. A form recipe should visibly contain its native label, control, help text, and error relationship. Klean does not hide that relationship behind Field, Label, description, or error components when the HTML is already the cleaner API. A Dialog is one native element containing the application's real heading, description, form, and actions; its real button trigger targets the dialog by ID. A Button should still look like a button implementation rather than a configuration interpreter.

Use slots for meaningful content and composition. Use props for behavior. Use `data-slot` for styling hooks. Avoid layers whose only job is to pass through another layer.

If a component cannot be understood in one careful pass, contributors should first try deleting indirection before documenting the indirection.

## Accessibility is the release gate

Accessibility is part of the component's definition of done, not a later audit. A visually complete component does not graduate while its interaction contract remains provisional.

At minimum, every component must prove the parts of this checklist that apply:

- correct native element or equivalent semantic role;
- an accessible name and any required description;
- complete keyboard operation, including predictable Tab order;
- visible focus that survives application colors and high-contrast settings;
- state communicated programmatically, not by color alone;
- disabled behavior that prevents activation without creating a keyboard trap;
- focus entry, containment, restoration, and dismissal for layered UI;
- errors associated with controls through `aria-describedby` and `aria-invalid` where appropriate;
- sufficient text, icon, boundary, and focus contrast;
- useful touch targets, with 44px as the default for touch-first actions;
- reduced-motion behavior for nonessential animation;
- icon-only controls with an accessible name;
- browser testing at narrow and wide viewports, with keyboard and screen-reader checks for complex interactions.

ARIA supplements correct HTML; it does not excuse incorrect HTML. Focus must not be removed merely because a custom ring looks inconvenient. Placeholder text must not replace a label. Error color must be accompanied by useful error text.

### Forms are an application contract too

Klean form primitives should make the good path easy:

- top-aligned, persistent labels;
- single-column layout by default;
- `fieldset` and `legend` for related choices;
- help and error text connected to the control;
- validation after the user leaves a field, then immediate recovery feedback;
- specific action labels such as “Save changes,” not “Submit”;
- duplicate submission prevention while Inertia is processing;
- success feedback that is perceivable without relying on color.

These rules belong in components, blocks, and documentation recipes. A primitive should expose the semantics needed to implement them without absorbing an Inertia request lifecycle into its base API.

## Durable UI is the interaction contract

Durable UI covers two things that a visual component catalog usually leaves to every application to rediscover:

1. **State resilience.** Put state in the right place so preferences survive, useful views are shareable, drafts and multi-step progress recover, and scroll position is restored when appropriate.
2. **Interaction resilience.** Dismiss layered UI in expected ways, preserve and restore focus, roll optimistic state back on failure, keep notifications alive through Inertia navigation, and cancel stale search work.

Klean is the copied-source implementation of that practice. Vue, React, and Svelte preserve the same outcomes using their own framework conventions.

The Durable UI surface includes:

- namespaced, versioned, SSR-safe browser storage with cross-tab synchronization;
- typed URL state with clean defaults, deliberate push/replace history, back/forward support, and optional Inertia server mode;
- expiring form drafts, restore/discard flows, dirty-state honesty, unsaved-change guards, and clear-on-success behavior;
- multi-step draft recovery with schema evolution and intentional step navigation;
- click-outside, backdrop, and Escape dismissal with listener cleanup and scroll locking;
- focus entry, trapping, return, and recovery after destructive list changes;
- optimistic toggles and list mutations only when success is highly likely and rollback is safe;
- window and container scroll restoration, asynchronous hash navigation, and Inertia `preserveScroll` guidance;
- a provider-free global Toast queue mounted in the persistent layout, updated in place for long work, paused on hover, focus, hidden pages, and window blur, with flash deduplication handled by stable ids in a small Boring Stack adapter;
- debounced client/server search with URL synchronization, loading and empty states, and stale-request cancellation.

The storage decision is conventional: ephemeral interaction state stays local, browser-only preferences use storage, shareable navigation context uses the URL, and cross-device or authoritative state stays on the server. Sensitive or server-owned data never goes into browser storage.

Zero configuration does not mean every pattern runs globally without being invoked. It means Klean supplies the correct source, safe defaults, and Boring Stack integration without requiring a registry manifest, provider hierarchy, state library, or parallel configuration language. Toast still needs one persistent renderer in the application layout; its imported `toast()` function needs no provider or setup. A Dialog still needs an accessible name and a real trigger relationship. Observed or controlled open state is optional and belongs only where application logic needs it. Those are semantic integration points, not configuration ceremony.

Read the complete scope and graduation criteria in [Durable UI in Klean](./durable-ui.md).

## The dependency ladder

Source ownership does not justify casual reimplementation of difficult accessibility behavior. Klean decides per component, in this order:

1. **Native HTML.** Use the platform when it already provides the required semantics and interaction.
2. **Small, readable framework behavior.** Add local framework logic when the contract remains short, obvious, and thoroughly testable.
3. **A focused unstyled primitive.** Use a mature headless dependency only when the remaining keyboard, focus, or WAI-ARIA behavior becomes too substantial to keep obvious and prove locally.

Button needs no interaction dependency. Popover starts with the browser's native Popover API and adds only collision geometry plus a readable fallback. Menu composes that Popover and adds a tested roving-focus/typeahead contract in framework-native source. Dialog uses the native top layer, focus containment and return, close requests, and invoker commands; Klean adds only dismissal policy, cleanup, state observation, and compatibility fallbacks. Toast uses a small framework-neutral queue and framework-native live-region renderer because browsers provide the semantics but not notification lifecycle management. More complex widgets such as Combobox may still justify a focused primitive after the native platform and small local behavior have been exhausted.

The rule is neither “no dependencies” nor “wrap a headless library for everything.” The rule is: choose the smallest dependency level that can prove the complete behavior.

## The visual thesis

Klean's own identity is neutral monochrome:

- white and near-white surfaces;
- near-black primary text and controls;
- calibrated gray for secondary hierarchy;
- strong typography before decorative chrome;
- whitespace before dividers;
- borders only where they clarify a boundary;
- restrained shadow and motion;
- visible, contrast-led focus.

Klean does not own a blue, amber, violet, or other product accent. A colorful Storybook control, browser chrome, or source-application recipe is not a Klean brand token. Product applications own color.

Monochrome does not mean low contrast or lifeless composition. It gives the work a recognizable editorial calm while leaving enough room for Hagfish, Slipway, and future applications to look genuinely different.

## Theming is CSS, not runtime configuration

Klean has no `ThemeProvider`, theme object, theme prop, preset code, or named-theme catalog. The application's existing Tailwind stylesheet is the theme. A local choice uses direct classes, a repeated product treatment becomes an application-owned component, and a genuinely shared value may become a Tailwind `@theme` variable.

Neutral primitive defaults work without a token setup step. Optional semantic tokens stay small and application-owned; they must not grow into component-specific variables that reproduce variants in CSS. Light and dark are modes rather than themes, and an application that offers a manual switcher may expose the resolved mode through one root `data-mode` attribute.

The complete convention and prior-art comparison live in [Theming Klean UI](./theming.md).

## Layout, typography, and motion rules

Klean's examples and blocks should model the following defaults:

- start mobile-first and add complexity at wider breakpoints;
- let flex and grid wrap before adding breakpoint-specific JavaScript;
- avoid fixed heights for text-bearing surfaces;
- constrain long-form copy to a readable measure;
- use heading levels for document structure and Tailwind for visual size;
- create hierarchy with size, weight, and color together;
- prefer a larger gap between groups than within a group;
- use spacing first, background change second, and dividers only when density requires them;
- avoid turning every section into a bordered card;
- keep important actions reachable and touch-friendly on narrow screens;
- keep transitions short and honor `prefers-reduced-motion`;
- provide deliberate dark-mode classes when a component claims dark-mode support.

Responsive behavior is part of the documented component contract. A story shown only at a generous desktop width is not sufficient proof.

## Boring Stack alignment

Klean is tightly coupled to The Boring JavaScript Stack at the pattern layer, not through hidden runtime magic in every primitive.

Its documentation and later blocks should make these paths excellent:

- Sails actions and server-side validation;
- Inertia forms, processing, progress, and success states;
- authentication and settings flows;
- flash messages, empty states, and error states;
- CRUD pages, navigation shells, filters, and data interfaces.
- Durable UI state, recovery, dismissal, focus, optimistic, scroll, notification, and search patterns.

Primitives remain readable framework-native components. Boring Stack knowledge appears in the examples and composed blocks where it is useful. Button does not import Inertia merely because many consuming forms use it.

## Hagfish and Slipway are proofs

Hagfish and Slipway should not be reduced to themes called `hagfish` and `slipway`.

Hagfish proves that a lean primitive can carry expressive, high-contrast, physical styling with generous targets and offset interaction. Slipway proves that the same contract can carry compact operational controls, neutral density, dark-mode inversion, destructive actions, and request state.

Klean extracts the shared semantic and behavioral contract. Each application retains its visual recipe. If both applications require different markup, that is evidence to improve slots or anatomy—not evidence to add a visual variant prop.

Before a component graduates, both proving grounds should be able to:

- adopt its source without losing their existing visual language;
- restyle it without editing obscure internals;
- express application state through native attributes, slots, and classes;
- pass the same accessibility contract;
- remain recognizably Hagfish or Slipway.

## Framework-native implementations

Vue, React, and Svelte share semantics, states, parts, and accessibility outcomes. They do not share a lowest-common-denominator runtime, and none is presented as the definition of Klean UI.

Every implementation should feel native:

- Vue uses `class`, slots, attributes, and Vue state conventions;
- React uses `className`, composition, and React state conventions;
- Svelte uses `class`, snippets or slots appropriate to its version, and Svelte state conventions.

API spelling may differ when framework idiom demands it. Behavioral outcomes and accessibility may not.

## Documentation is part of the component

Storybook is the component laboratory. The future Sailscasts docs site is the public learning and installation experience. Both should present the same contract.

Every component page should include:

1. a neutral live preview;
2. the smallest useful usage example;
3. the source that will land in the application;
4. native attributes, behavioral props, slots, parts, and state hooks;
5. accessibility and keyboard behavior;
6. Tailwind recipes, including direct classes and an application-owned wrapper;
7. Boring Stack examples where relevant;
8. Hagfish and Slipway proof recipes;
9. narrow, wide, disabled, loading, error, and dark-state examples as applicable;
10. the component's direct dependencies and why they exist.
11. the Durable UI behavior that applies, including persistence, history, dismissal, focus, recovery, cancellation, and cleanup.

Documentation must never imply a variant API that the component does not have. Examples should make source ownership and direct Tailwind styling feel like the easiest path.

## What Klean takes from shadcn

Klean learns from shadcn's strongest ideas:

- distribute readable source instead of a sealed visual package;
- show a live component beside its usage and source;
- use a registry to declare files and direct dependencies;
- let the application own and modify the installed result;
- rely on mature unstyled interaction primitives when behavior is genuinely complex.

Klean is not a framework-specific spelling of shadcn. Its Boring Stack conventions let the normal path be smaller: no required initialization file, no `components.json` equivalent, no alias survey, no generated class-helper concept, no style selection, and no component variant matrix.

The influence is source ownership and excellent teaching. The Klean contribution is convention over configuration, Tailwind as the explicit visual API, and a stricter separation between behavior and product design.

## Component graduation gate

A component is ready to leave the workbench only when all applicable answers are yes:

- Is the native element or semantic model correct?
- Can the public API be explained without describing CSS choices?
- Can a developer restyle it with ordinary Tailwind classes?
- Are caller classes reliably last?
- Are slots and state hooks sufficient without exposing private DOM accidents?
- Does keyboard and focus behavior pass the documented contract?
- Are names, descriptions, errors, and state available to assistive technology?
- Does it work at narrow and wide viewports?
- Does reduced motion work?
- Is every dependency necessary, direct, and documented?
- Does every applicable Durable UI behavior survive reload, navigation, dismissal, error, and cleanup?
- Can Hagfish and Slipway preserve their distinct designs with the same primitive?
- Is the source short enough to own confidently?
- Do Storybook, tests, and written docs agree?

If the answer is no, the component remains provisional.

## Non-goals

Klean is not trying to:

- win by shipping the largest component catalog;
- encode every product design as a prop combination;
- make Hagfish and Slipway look alike;
- hide HTML behind a branded vocabulary;
- force framework parity before the design is proven;
- replace Tailwind with a second styling language;
- absorb unrelated Inertia, Sails, or Durable UI behavior into every primitive;
- avoid all dependencies as a matter of ideology;
- automate an installation model that has not survived real use.

## The final test

Ask these questions during every review:

> Does this make native HTML, accessibility, and Tailwind easier to use—or does it make the developer negotiate with Klean?

> Can the application own this source without first learning our private styling language?

> Did we add a real behavior, or did we disguise a class as a prop?

If Klean is doing its job, the developer should think: “I understand this. I can change it. It belongs to this app.”
