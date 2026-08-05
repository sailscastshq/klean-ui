# Theming Klean UI

## Decision

Klean does not have a theme API.

There is no `ThemeProvider`, `useTheme()`, theme prop, theme object, preset code, named-theme catalog, or `klean-ui.json` section. The application's CSS is the theme, Tailwind classes apply it, and the copied component source remains ordinary framework-native code.

The rule is:

> Theme in CSS. Style with Tailwind. Put only user-selected mode on the document.

This keeps the zero-configuration path honest. A component works with its neutral defaults immediately. An application can then restyle one instance, create an application-owned wrapper, or introduce a few shared CSS tokens without learning another styling system.

## Theme and mode are different

Klean uses these words precisely:

- **Theme** is the application's enduring visual language: palette, typography, spacing, radius, shadow, and density.
- **Mode** is a user or environment state such as light or dark.
- **Recipe** is a repeated product treatment written as Tailwind classes in an application-owned component.

A theme is not runtime component state. A mode can be runtime state, but components should observe it through CSS rather than a framework context or injection system.

## Prior art

The useful ideas are already visible across established systems. So are the costs Klean should avoid.

| System                                                                | Useful idea                                                                                                    | Klean boundary                                                                                                                                      |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Tailwind CSS](https://tailwindcss.com/docs/theme)                    | `@theme` turns CSS design tokens into ordinary utilities and keeps styling in the language Klean already uses. | This is the foundation. Klean should not add a second token compiler.                                                                               |
| [shadcn/ui](https://ui.shadcn.com/docs/theming)                       | Semantic CSS variables let source-owned components share application colors.                                   | Klean avoids the required `components.json`, initialization choice, preset codes, base-color selection, and large component-oriented token surface. |
| [Radix Themes](https://www.radix-ui.com/themes/docs/components/theme) | CSS variables can inherit through a subtree.                                                                   | Klean does not wrap the tree in a runtime component or expose `accentColor`, `radius`, `scaling`, `appearance`, and component variants as props.    |
| [Chakra UI](https://chakra-ui.com/docs/theming/semantic-tokens)       | Semantic tokens are more durable than literal palette names.                                                   | Klean does not require a JavaScript styling system, theme configuration object, recipe engine, or generated token typings.                          |
| [Mantine](https://mantine.dev/theming/mantine-provider/)              | A centralized palette can coordinate an application.                                                           | Klean does not need a root provider that manages context, injects variables, resolves schemes, and owns storage.                                    |
| [daisyUI](https://daisyui.com/docs/themes/)                           | CSS variables and a document attribute make alternate color sets possible.                                     | Klean does not ship a catalog of named visual personalities or make applications select from them.                                                  |

The conclusion is not that theming is bad. The conclusion is that CSS already provides the right inheritance model, and Tailwind already provides the right authoring API.

## The zero-configuration baseline

Running this command must not ask about a theme:

```bash
npx klean-ui add button
```

The installed Button includes a neutral, accessible Tailwind treatment using concrete utilities. It does not require global Klean variables in order to render correctly. The command should not generate a theme file, mutate an application palette, or ask the user to choose a base color.

Copyable Klean recipes follow the same rule: they use Tailwind's built-in utilities or explicit arbitrary values, so they work without hidden `klean-*` tokens. When documentation demonstrates an application-owned theme utility such as `bg-brand`, it must label the required application CSS beside the example.

This matters because a primitive and a design system have different lifetimes. The primitive should remain useful even when an application later replaces every visual choice.

## Three levels of styling

Use the smallest level that solves the problem.

### 1. One local treatment: use classes

```vue
<Button class="bg-emerald-700 text-white hover:bg-emerald-800">
  Approve invoice
</Button>
```

No theme abstraction is needed for a local decision.

### 2. One repeated product concept: create a component

```vue
<!-- assets/js/components/PrimaryButton.vue -->
<script setup>
import Button from "./ui/button/Button.vue";
</script>

<template>
  <Button
    class="min-h-11 rounded-md bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800"
  >
    <slot />
  </Button>
</template>
```

This is the normal Klean replacement for `variant="primary"`. The product concept receives a product name and stays editable in the product.

### 3. One value shared across the application: use a Tailwind theme variable

Add shared values to the conventional Tailwind entry at `assets/css/app.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.49 0.16 154);
  --color-on-brand: oklch(0.985 0 0);
}
```

Then use the generated utilities directly:

```vue
<Button class="bg-brand text-on-brand hover:bg-brand/90">
  Approve invoice
</Button>
```

The token creates Tailwind utilities. It does not create component variants.

## Optional semantic foundations

Applications that need coordinated light/dark values or white-label branding can use a small semantic foundation. This is an application convention, not a prerequisite for installing Klean.

Prefer a short vocabulary based on visual roles:

- `canvas`: the page background;
- `ink`: primary content and high-emphasis neutral controls;
- `surface`: a distinct raised or floating surface;
- `muted`: secondary content;
- `line`: necessary boundaries;
- `focus`: the keyboard focus indicator.

Keep product signals explicit and paired with their readable foreground, for example `brand` / `on-brand` or `danger` / `on-danger`.

Tailwind v4's `@theme inline` can map mode-aware application variables to clean utilities:

```css
@import "tailwindcss";

:root {
  --app-canvas: oklch(0.985 0 0);
  --app-ink: oklch(0.145 0 0);
  --app-surface: oklch(1 0 0);
  --app-muted: oklch(0.45 0 0);
  --app-line: oklch(0.87 0 0);
  --app-focus: oklch(0.45 0 0);
  color-scheme: light;
}

:root[data-mode="dark"] {
  --app-canvas: oklch(0.145 0 0);
  --app-ink: oklch(0.985 0 0);
  --app-surface: oklch(0.205 0 0);
  --app-muted: oklch(0.708 0 0);
  --app-line: oklch(1 0 0 / 16%);
  --app-focus: oklch(0.708 0 0);
  color-scheme: dark;
}

@theme inline {
  --color-canvas: var(--app-canvas);
  --color-ink: var(--app-ink);
  --color-surface: var(--app-surface);
  --color-muted: var(--app-muted);
  --color-line: var(--app-line);
  --color-focus: var(--app-focus);
}
```

Application recipes remain ordinary Tailwind:

```vue
<Button class="bg-ink text-canvas outline-focus hover:bg-ink/85">
  Continue
</Button>
```

Klean should not standardize hundreds of component-specific variables. Avoid tokens such as `--button-primary-hover-background`, `--card-large-radius`, or `--dialog-elevation`. They recreate the component configuration matrix in CSS.

## Light and dark mode

An application that simply follows the operating system can use Tailwind's default `dark:` behavior. That requires no Klean setup.

When an application offers a manual switcher, the Boring Stack convention should be one resolved attribute on the root element:

```html
<html data-mode="dark"></html>
```

The existing Tailwind stylesheet can bind `dark:` to that attribute:

```css
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));
```

Only `light` or `dark` belongs in `data-mode`. If the user's stored preference is `system`, a small application-owned helper resolves the media query and writes the resulting mode before paint. A server-readable cookie is preferable when an application needs to prevent a flash during server rendering.

Klean may later ship a copied-source `ThemeToggle` block for this behavior. It must remain optional and must not become a dependency of primitives.

Use `color-scheme: light` or `dark` with the resolved mode so native form controls, scrollbars, and browser-provided UI match the page.

## White-label applications

Multiple brands are the valid case for scoped variables:

```css
[data-brand="harbor"] {
  --app-brand: oklch(0.49 0.16 236);
  --app-on-brand: white;
}

[data-brand="orchard"] {
  --app-brand: oklch(0.52 0.16 145);
  --app-on-brand: white;
}
```

The application owns the brand names and selects the scope. Klean still does not ship `harbor`, `orchard`, `hagfish`, or `slipway` as themes.

Nested theme scopes should be rare. They are appropriate for a white-label preview, embedded tenant surface, or documentation specimen—not as the normal way to style individual components.

## What should become a token?

A value earns a token when changing it should intentionally update several unrelated consumers.

| Question                                            | Use                                 |
| --------------------------------------------------- | ----------------------------------- |
| Is this styling unique here?                        | Direct Tailwind classes             |
| Is this a repeated product concept?                 | Application-owned component         |
| Is this one value shared across unrelated surfaces? | Tailwind `@theme` variable          |
| Is this light/dark user state?                      | CSS variables plus root `data-mode` |
| Is this a tenant brand?                             | Scoped application variables        |
| Does this change component behavior?                | A behavioral prop                   |

Do not tokenize a value merely because it exists. A short token vocabulary is easier to understand, test, and replace than a complete transcription of CSS.

## Accessibility invariants

Changing a theme must never weaken the component contract.

Every supported mode and brand scope must preserve:

- WCAG AA contrast for text and meaningful icons;
- visible focus against canvas, surface, and high-emphasis controls;
- boundaries for controls when the surface alone does not reveal them;
- states communicated through text, icons, or semantics instead of color alone;
- readable disabled content without making it indistinguishable;
- reduced-motion behavior independently of theme;
- native control rendering that matches the resolved `color-scheme`;
- forced-colors behavior without unnecessary `forced-color-adjust: none`.

Foreground and background values should be reviewed as pairs. Klean should not attempt runtime contrast guessing; applications should choose and test deliberate pairs such as `brand` and `on-brand`.

## CLI and documentation contract

The Klean CLI must follow these rules:

- `add button` never asks about theme, mode, color, radius, or density;
- adding a primitive never generates a provider or configuration file;
- adding a primitive does not rewrite an existing application palette;
- registry metadata may declare required CSS only when the component cannot work without it;
- any future mode toggle is added explicitly as copied application source;
- nonstandard stylesheet paths use an explicit CLI flag rather than persistent configuration.

Every component page should show:

1. the neutral zero-configuration default;
2. direct Tailwind restyling;
3. an application-owned recipe;
4. a semantic-token example only when it materially helps;
5. light and dark accessibility proof when the component claims both.

## The test

Ask this before adding any theming feature:

> Could this be ordinary CSS, a Tailwind class, or an application-owned component?

If yes, Klean should not invent an API for it.
