# Klean UI on docs.sailscasts.com

The current Sailscasts docs site is a VitePress application with a custom theme, global preview components, local search, project sidebars, and Markdown content. Klean can fit that architecture without allowing the host framework to define Klean's framework support.

## Proposed first docs slice

```text
docs/klean-ui/
  index.md
  design-philosophy.md
  durable-ui.md
  button.md
docs/.vitepress/theme/components/klean/
  ComponentPreview.vue
  CopyCode.vue
  button/Button.vue
```

The docs theme registers `ComponentPreview` globally, just as it currently registers `ProjectGrid`. A component page can then combine prose, a live framework example, exact source for Vue, React, or Svelte, copy controls, and an API table in one place.

## Styling without disrupting VitePress

Add Tailwind CSS v4 to the docs build, but import only its theme and utilities layers so Tailwind Preflight does not reset the existing VitePress theme. Scan only the Klean preview components and Klean Markdown pages.

The canonical registry source should be copied into the docs theme during a small sync step. That keeps the rendered example identical to the source users receive while preserving the source-owned distribution model.

## Page order

1. Live preview and concise promise, including the applicable Durable UI guarantee.
2. Install or copy command when the registry exists.
3. Usage example.
4. State, recovery, dismissal, and product recipe previews.
5. API, accessibility, and Durable UI contract.
6. Full source with copy action.

Storybook remains the development workbench and edge-case catalog. VitePress becomes the polished learning and adoption surface. The same story scenarios can later drive visual regression without embedding Storybook inside the public docs page.

## Launch sequence

1. Stabilize Button behavior in Hagfish issue #242.
2. Graduate the source into the Klean registry shape.
3. Add the Klean section and preview components to docs.sailscasts.com.
4. Reuse the Button state and recipe matrix from this Storybook.
5. Publish the Durable UI decision framework and framework-native implementation roadmap.
6. Add copy/install UX only when the registry output is real.
