# Klean UI on docs.sailscasts.com

The public Klean UI documentation belongs on `docs.sailscasts.com`, inside a dedicated Klean UI section with Doctrine, Durable UI, Theming, Installation, CLI, and a Components subsection. Component names do not become the top-level information architecture.

## Component-page contract

Every component page should provide, in this order:

1. a concise semantic promise;
2. the same installation command for Vue, React, and Svelte;
3. a live isolated preview;
4. framework-native usage and semantic recipes;
5. API, accessibility, and applicable Durable UI guarantees;
6. syntax-highlighted, copyable source.

The first Button page implements this in VitePress with Preview and Source tabs. Preview markup is isolated from VitePress theme styles, while the Source view uses VitePress's build-time syntax highlighting and copies the exact text shown.

## Registry relationship

The package registry is the source-installation contract:

```text
registry/button/vue/Button.vue
registry/button/react/Button.jsx
registry/button/svelte/Button.svelte
```

The public docs may render one framework at a time, but wording and installation must remain framework-neutral. Any source copied into the docs theme for a live preview must stay behaviorally identical to the corresponding registry item. Registry changes and public examples should be reviewed together until this synchronization is automated.

## Styling without disrupting VitePress

Klean previews use scoped Tailwind output so host typography rules, anchor decoration, resets, and application CSS cannot leak into the component canvas. Dark-mode state is synchronized into that isolated preview rather than supplied through a Klean provider.

This isolation is a documentation concern, not a component runtime. Installed source remains ordinary framework-native code and uses the consuming application's Tailwind stylesheet.

## Storybook and VitePress

Storybook is the development workbench: controls, semantic states, edge cases, accessibility inspection, and product recipes. VitePress is the polished adoption surface: doctrine, installation, live examples, exact source, and copy behavior.

The two surfaces should share the same component contract without embedding Storybook in public documentation or presenting Storybook's story names as the public sidebar.
