# Klean UI

Klean UI means Kelvin's Lean UI: the copied-source UI system for The Boring JavaScript Stack. It supports Vue, React, and Svelte with framework-native components and Durable UI patterns so markup, state, navigation context, and interactions remain accessible and resilient. The source belongs to the application as soon as it is added.

This branch contains the provisional Button workbench from [issue #4](https://github.com/sailscastshq/klean-ui/issues/4). The complete Durable UI implementation is tracked in [issue #7](https://github.com/sailscastshq/klean-ui/issues/7). Final registry extraction waits for the behavioral proof in [Hagfish issue #242](https://github.com/sailscastshq/hagfish/issues/242).

## See the component

```bash
npm install
npm run storybook
```

Storybook opens at `http://localhost:6006`. Start with **Klean UI / Introduction**, then open **Components / Button** for controls, semantic element recipes, source-app uses, and API documentation.

## Validate the slice

```bash
npm test
npm run build
npm run build-storybook
```

## Current Button prototype

The current workbench is exercising one implementation of the framework-neutral Button contract:

```vue
<script setup>
import Button from "@/components/ui/button/Button.vue";
</script>

<template>
  <Button type="submit" :disabled="form.processing">
    <Spinner v-if="form.processing" aria-hidden="true" />
    {{ form.processing ? "Saving" : "Save changes" }}
  </Button>
</template>
```

The public props are behavioral: `as`, `type`, and `disabled`. Styling remains the ordinary `class` attribute, and caller classes win last. There is intentionally no `variant`, `size`, `tone`, or generated public `cn.js` API; repeating visual recipes become application-owned components styled with Tailwind.

## Durable UI is part of Klean

Klean is both a component system and the canonical implementation of our Durable UI practice. Vue, React, and Svelte receive idiomatic copied-source components and state utilities for resilient storage, shareable URL state, draft recovery, multi-step progress, predictable dismissal, focus management, optimistic rollback, scroll restoration, toast queues, and cancellable debounced search.

This does not put every behavior into every primitive. Button remains a Button. Durable behavior lives in the component, composable, or Boring Stack block that owns it, behind one opinionated Klean API and without a required provider, manifest, or state-library configuration.

Read [the design philosophy and shadcn boundary](./docs/design-philosophy.md), [the Durable UI contract](./docs/durable-ui.md), [the theming convention and prior-art study](./docs/theming.md), [the Button contract](./docs/button.md), and [the Sailscasts docs plan](./docs/docs-site-plan.md).
