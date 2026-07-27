# Klean UI Research

## Working Thesis

Klean UI should be the default UI path for **The Boring JavaScript Stack**.

But it should not behave like a traditional UI package where people import `KleanButton` from a library and then fight the abstraction for the next six months.

Klean should behave more like **shadcn-style source distribution for boring-stack apps**:

- copied source, not rented abstractions
- local components, not vendor-owned components
- Tailwind classes as the styling API
- HTML-first markup
- minimal behavior props
- strong boring-stack patterns later

The mental model is:

> Klean gives you beautiful, boring-stack-ready primitives that still feel like native HTML with Tailwind on top.

## The Real Problem

Most UI libraries become stressful at the exact moment a real app begins.

They look good in the demo, but then:

- you want to change spacing and start reading internals
- you want to swap markup and discover the abstraction owns too much
- you want to restyle a control and get buried in props
- you want your own class names to win and the library argues back
- you end up writing wrappers around wrappers around wrappers

That is the problem Klean should solve.

Not "how do we ship more components than everyone else?"

The real question is:

> How do we give boring-stack developers a UI system they can actually own?

## The Algorithm Lens

Klean should be shaped by subtraction first.

### 1. Question Every Requirement

Before building anything, question the usual assumptions:

- Do we need a traditional published UI package? No.
- Do we need styling props for every visual choice? No.
- Do we need a giant component zoo first? No.
- Do we need tables before primitives? No.
- Do we need framework parity before the model is calm? No.
- Do we need Klean-branded component names in app code? No.

### 2. Delete Anything Nonessential

Delete early:

- `@klean-ui/button`-style runtime consumption
- `KleanButton` and other branded component names in app code
- variant props that only exist to express styling
- theme props for things that should just be classes
- clever wrappers around simple HTML
- heavy framework-specific dependencies in the first version

### 3. Simplify What Remains

The surviving path should be:

- install copied source into the app
- keep component markup shallow
- forward native attributes
- let user classes win last
- use props for behavior and semantics, not styling politics
- expose state with `data-*` when useful

### 4. Accelerate Feedback

The fastest honest proof path is:

1. define doctrine
2. build a small primitive set
3. use it in a real boring-stack page
4. restyle it without touching internals
5. only then expand

### 5. Automate Last

Do not start with the CLI and registry as the main event.

First prove:

- the primitives feel good in a real app
- copied source feels liberating, not messy
- class overrides are calm
- boring-stack developers can move quickly with it

Then add:

- registry manifests
- `klean add button`
- `klean add dialog`
- `klean add login-form`

## The Core Doctrine

### 1. Styling Is The Prop

Klean should not try to encode every visual decision as a prop.

Not this:

- `variant="primary"`
- `tone="danger"`
- `radius="lg"`
- `elevated`
- `fullWidth`

unless the prop is doing real behavioral or semantic work.

The main styling API should be:

- `class` in Vue and Svelte
- `className` in React
- design tokens underneath
- predictable slots and data attributes

If a developer wants a button red, larger, flatter, or more square, they should mostly do that with classes.

**Style should happen as if they are styling HTML.**

### 2. No Vendor-Owned Components In Userland

Klean should not ask people to write:

```js
import { KleanButton } from 'klean-ui'
```

That is the wrong feeling.

The right feeling is:

```js
import Button from '@/components/ui/button'
```

or, for very simple cases:

```html
<button class="...">Save</button>
```

Klean may generate a local `Button`, but it should belong to the app the second it lands.

### 3. HTML First

If a native element already does the job, stay close to it.

Klean should feel like:

- a good `button`
- a good `input`
- a good `label`
- a good `dialog` pattern

not like a miniature design-system bureaucracy.

### 4. Props Are For Behavior

Props should mostly exist when they express real behavior or semantics:

- `disabled`
- `loading`
- `checked`
- `open`
- `modelValue` / `value`
- `type`

Props should not be the main styling channel.

### 5. User Classes Win

If a Klean primitive cannot be restyled by app-level classes without pain, it has failed.

Rules:

- forward class input naturally
- merge defaults conservatively
- let user classes win last
- keep specificity low
- avoid internal styles that trap the developer

### 6. Obvious Anatomy

Every component should have visible, boring anatomy.

For example, a button should still read like a button.

A field should read like:

- label
- control
- help text
- error text

A dialog should read like:

- overlay
- panel
- title
- body
- actions

The goal is that someone can open the source and understand it instantly.

## Klean's Relationship To The Boring Stack

Klean should be **tightly coupled to The Boring JavaScript Stack at the pattern level**, not at the runtime-lock-in level.

That means Klean should become the default path for:

- auth screens
- settings pages
- dashboard shells
- CRUD pages
- forms
- tables
- flash and validation UI
- empty, loading, and error states

But the coupling should show up in:

- docs
- starter templates
- generated blocks
- page patterns
- Inertia and Sails-friendly examples

Not in:

- hard stack magic inside every primitive
- hidden dependencies on Durable UI
- black-box package abstractions

## Klean vs Durable UI

These should stay separate.

### Klean

Klean distributes:

- primitives
- interaction components
- composed UI blocks
- boring-stack page patterns
- copied source

### Durable UI

Durable UI distributes:

- URL state utilities
- storage utilities
- remembered state helpers
- durable forms
- filter and pagination helpers
- imported logic

Klean can choose to use Durable UI in specific generated blocks later, especially for:

- filter bars
- tables
- persistent tabs
- remembered layouts

But Klean core should not require Durable UI by default.

## Primitive-First Roadmap

Klean should begin with the smallest set of primitives a real boring-stack app needs.

### Phase 1: Core Primitives

- Button
- Input
- Textarea
- Label
- Field
- Select
- Checkbox
- Radio Group
- Switch
- Card
- Badge
- Separator
- Spinner

This phase answers the most important questions:

- how does class override work?
- how shallow is the markup?
- how are errors and help text handled?
- how do we keep things close to HTML?

### Phase 2: Interaction Primitives

- Dialog
- Popover
- Dropdown Menu
- Tooltip
- Tabs
- Toast
- Command Menu

This phase proves:

- accessibility contracts
- focus handling
- escape hatches
- interaction patterns without styling prison

### Phase 3: Data And App Pieces

- Table
- DataTable
- Filter Bar
- Pagination
- Row Actions
- Bulk Actions
- Empty State
- Loading State
- Error State
- Sidebar
- Page Header

These should come **after** the primitives feel right.

DataTable should not be the thing that teaches us what Button, Field, Menu, and Dialog should have been.

## What Klean Can Learn From Inertia Table

The [Inertia Table](https://inertiaui.com/inertia-table) product is useful to study because it proves that developers want **beautiful, powerful data interfaces** without rebuilding the same table plumbing every time.

Useful takeaways:

- powerful filtering matters
- row actions matter
- bulk actions matter
- views and saved table states matter
- sorting and pagination should feel first-class
- customization matters as much as power

The most relevant lesson is not "copy the exact product."

It is this:

> advanced components win when they provide serious capability without taking ownership away from the developer.

Inertia Table explicitly presents customization and reusable styling as part of its value. That is a clue for Klean.

Klean's later table system should aim for:

- beautiful defaults
- obvious anatomy
- class-based customization
- boring-stack-friendly query and filter patterns
- optional Durable UI integration for URL-backed table state

But tables are not the opening act.

The opening act is primitives.

## The Klean Consumption Model

Klean should be distributed in layers.

### 1. Primitive Source

Example:

```bash
klean add button
klean add input
klean add field
```

This writes local source into the app.

### 2. Interaction Source

Example:

```bash
klean add dialog
klean add dropdown-menu
klean add tabs
```

### 3. Boring Stack Blocks

Later:

```bash
klean add login-form
klean add settings-shell
klean add resource-table
```

These blocks may compose primitives and, when needed, optionally use Durable UI imports.

## Naming Rules

### Product Name

- **Klean UI**

### Repository Name

- `klean-ui`

### CLI

- `klean`

### Component Names In Apps

Use simple, local names:

- `Button`
- `Input`
- `Field`
- `Dialog`

Never require:

- `KleanButton`
- `KleanInput`
- `KleanDialog`

The brand should live in the distribution system, not in every line of app code.

## Default Technical Biases

The first version should bias toward:

- Vue first
- copied source
- Tailwind-first styling
- token-backed classes
- shallow markup
- slots over prop soup
- local ownership
- boring-stack examples

The first version should avoid:

- package-first runtime consumption
- heavy style prop APIs
- framework parity pressure
- giant component count
- data table before primitives
- hidden behavior engines

## The Standard For Success

Klean succeeds if a developer feels:

- "I understand this component immediately."
- "I can restyle this without negotiating with a library."
- "This feels like my app, not a vendor skin."
- "I can move fast without UI chaos."

It fails if a developer feels:

- "I need to read the internals to change one small thing."
- "The props are fighting my design."
- "This is just another library with better marketing."

## The Short Version

Klean should be:

- tightly aligned with The Boring JavaScript Stack
- primitive first
- copied source, not imported vendor UI
- styled through classes, not style props
- close to HTML
- Tailwind-native
- extensible into richer things like tables later

In one sentence:

> Klean UI should make boring-stack developers feel like they finally have a real design system without giving up the freedom of native HTML and Tailwind.
