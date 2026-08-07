# Durable UI in Klean

Klean UI is the canonical copied-source implementation of our Durable UI practice for The Boring JavaScript Stack. It does not stop at visual primitives. It supplies framework-native components, state utilities, and application blocks that make client-side state and interactions resilient without asking each application to invent another configuration layer.

Vue, React, and Svelte are equal Klean targets. They share behavioral outcomes and accessibility contracts without sharing a lowest-common-denominator runtime or forced API spelling.

## The promise

Durable UI has two halves:

- **State resilience:** the right state survives reloads and navigation, and shareable state appears in the URL.
- **Interaction resilience:** layered UI dismisses predictably, focus never gets lost, async work recovers from failure, and transient feedback remains perceivable.

Klean makes those outcomes conventional. Applications receive readable source, safe defaults, semantic integration points, Inertia-aware recipes where appropriate, and Tailwind styling they can replace directly.

## Where state belongs

| State                         | Conventional home         | Examples                                                    |
| ----------------------------- | ------------------------- | ----------------------------------------------------------- |
| Ephemeral                     | Framework component state | Open dropdown, hover, temporary dialog state                |
| Browser preference            | Versioned local storage   | Sidebar, mode preference, dismissed banner, visible columns |
| Shareable navigation context  | URL query parameters      | Tab, filters, sorting, pagination, deep-linked modal        |
| Current Inertia visit         | Inertia remembered state  | State that only needs to survive application navigation     |
| Authoritative or cross-device | Sails session or database | Cart, account preference, server-owned records              |

Sensitive information, authentication material, and duplicated server state never belong in local storage.

## Framework-neutral contract, framework-native source

Names are provisional until each implementation graduates, and exact spelling follows the framework, but the intended surface and outcomes are deliberately small.

### State resilience

- `useDurableStorage` — namespaced and versioned storage, SSR safety, error handling, default cleanup, and cross-tab synchronization.
- `useDurableUrl` — typed URL state, clean default omission, deliberate `push` versus `replace`, back/forward support, debouncing, and optional Inertia server mode.
- `useFormDraft` — expiring drafts, debounced saves, restore/discard, dirty-state honesty, unsaved-change guards, and clear on successful submission.
- `useWizardDraft` — single-page or multi-page progress recovery, current-step persistence, aggregate submission, schema evolution, and complete cleanup.
- `useScrollRestore` — session-scoped window/container restoration, Inertia departure capture, asynchronous hash targets, and no competition with browser restoration.

### Interaction resilience

- `useClickOutside` and layered components — outside click for menus, backdrop click for blocking overlays, Escape dismissal, conditional listeners, cleanup, and body-scroll locking.
- Dialog, Menu, Popover, and related components — native semantics first, complete keyboard behavior, focus entry/containment/return, and safe dismissal behind Klean's public API.
- `useOptimistic` — immediate state only for high-confidence reversible actions, with inflight protection, server resynchronization, rollback, and perceivable errors.
- Toast components and `useToast` — a global bounded queue that survives Inertia page swaps, deduplicates flash messages, pauses on hover, supports manual dismissal, and announces through `aria-live`.
- `useDebounce` and search blocks — client or server search, hygienic URL synchronization, loading and empty states, result feedback, minimum query rules, and `AbortController` cancellation.
- Focus recovery utilities — return focus after dismissal and move it to the next logical target after list mutation or deletion.

## UI honesty

Durability is not only storage. The interface must reflect what is actually true:

- a submit action is disabled until an edit form is dirty;
- busy and saved messages appear only while those states are real;
- optimistic changes roll back and explain failure;
- selected and pressed states are communicated programmatically;
- a restored draft is offered rather than silently overwriting server data;
- a successful submission clears its draft;
- stale searches cannot overwrite newer results.

## Convention over configuration

The standard Boring Stack path has no Durable UI initializer, manifest, provider maze, state-library requirement, or storage questionnaire.

Klean infers the framework and conventional source locations. A copied component or composable carries its own local behavior and direct dependencies. Some patterns still require an honest integration point: a toast host belongs in the persistent application layout, a dialog needs an accessible name and a native trigger relationship, and server-backed URL filters use Inertia. Controlled dialog state is optional. Klean documents and generates those source changes directly instead of hiding them in configuration.

## Dependencies remain an implementation decision

Klean is the only public UI API an application needs. Native browser behavior comes first. Small, readable framework behavior comes second. When a complex component needs a focused accessibility primitive for reliable focus, keyboard, positioning, or ARIA behavior, Klean may use or vendor it internally. The application still consumes and owns Klean source rather than configuring a second component system.

## Graduation gate

A Durable UI implementation does not graduate until applicable answers are yes:

- Does it choose the correct persistence tier?
- Is browser API access SSR-safe and failure-tolerant?
- Are keys namespaced, versioned, and cleaned up?
- Do URL defaults stay clean and browser history behave as expected?
- Do drafts expire, restore deliberately, and clear after success?
- Do Escape, outside click, backdrop click, and listener cleanup behave correctly?
- Does focus enter, stay contained where required, return, and recover after deletion?
- Does every optimistic path have a tested rollback and visible failure message?
- Does scroll restoration wait for content and avoid fighting the browser?
- Do notifications survive Inertia navigation and remain accessible?
- Does debounced search cancel stale work and expose loading, results, and empty states?
- Can Hagfish and Slipway adopt the source without adding configuration or losing their design language?

This is the implementation roadmap as well as the documentation contract. A Storybook example proves interaction and edge cases; the Sailscasts docs page teaches the decision and shows the exact source that lands in the application. Delivery is tracked in [Klean UI issue #7](https://github.com/sailscastshq/klean-ui/issues/7).
