# Klean UI

Klean UI means Kelvin's Lean UI: source-owned, accessible UI for The Boring JavaScript Stack. It gives Vue, React, and Svelte applications framework-native components with neutral defaults, ordinary Tailwind styling, and Durable UI patterns. The source belongs to the application as soon as it is added.

## Add a component

Run the same command in every standard Boring Stack application:

```bash
npx klean-ui add button
npx klean-ui add input
npx klean-ui add textarea
```

Klean detects Sails and the frontend framework from `package.json` and the conventional application entry. It then installs the selected framework-native registry item and its prerequisites. Button is one source file:

```text
Vue      assets/js/components/ui/button/Button.vue
React    assets/js/components/ui/button/Button.jsx
Svelte   assets/js/components/ui/button/Button.svelte
```

There is no `init`, `klean-ui.json`, framework questionnaire, alias questionnaire, generated `cn.js`, or Klean runtime dependency. Each installed component is ordinary application code. Its visual API is `class` in Vue and Svelte or `className` in React, and caller Tailwind classes win.

Preview the resolved work without changing the application:

```bash
npx klean-ui add button --dry-run
```

Nonstandard Boring Stack applications can use explicit path overrides:

```bash
npx klean-ui add button \
  --components-dir assets/js/design-system \
  --css assets/styles/app.css
```

Klean will not silently replace edited source. Re-running an unchanged installation is a no-op; edited files produce a useful conflict and require the deliberate `--overwrite` flag.

Read [the complete installer contract](./docs/installer.md).

## Native form controls

Klean installs Input and Textarea independently. The application writes the real label, help, and error elements so the form remains obvious HTML instead of a configuration API.

```vue
<div class="grid gap-2">
  <label for="email">Email address</label>
  <Input
    id="email"
    v-model="form.email"
    name="email"
    type="email"
    autocomplete="email"
    required
    :aria-invalid="!!form.errors.email"
    :aria-describedby="form.errors.email ? 'email-help email-error' : 'email-help'"
  />
  <p id="email-help">We only use this for account messages.</p>
  <p v-if="form.errors.email" id="email-error">{{ form.errors.email }}</p>
</div>
```

Validation, IDs, messages, and values remain application-owned. Input and Textarea forward native attributes, while visual density, color, shape, and layout remain ordinary caller Tailwind classes. Read [the native form markup contract](./docs/forms.md).

## Button contract

Button has behavioral inputs only: rendered element, native button type, and disabled semantics. Actions remain buttons; navigation renders a native anchor or the Boring Stack/Inertia Link component. Loading labels and product styling remain application concerns.

```vue
<script setup>
import Button from "@/components/ui/button/Button.vue";
</script>

<template>
  <Button
    type="submit"
    :disabled="form.processing"
    class="rounded-full bg-emerald-700 px-6 hover:bg-emerald-800"
  >
    {{ form.processing ? "Saving" : "Save changes" }}
  </Button>
</template>
```

There is intentionally no `variant`, `size`, `tone`, `color`, `radius`, or generated class-helper API. Repeated visual treatments become application-owned components styled with Tailwind.

## Component workbench

```bash
npm install
npm run storybook
```

Storybook opens at `http://localhost:6006`. Start with **Klean UI / Introduction**, then open **Components / Button**, **Components / Input**, or **Components / Textarea** for live controls, states, recipes, source, and accessibility documentation.

## Validate Klean UI

```bash
npm test
npm run build
npm run build-storybook
npm pack --dry-run
```

The package contains the CLI and its versioned registry. It does not publish the Storybook, development build, or framework runtimes.

## Doctrine

Klean is the canonical implementation of our Durable UI practice. Durable behavior lives in the component, composable, or Boring Stack block that owns it; it does not turn every primitive into a state-management abstraction.

Read [the design philosophy](./docs/design-philosophy.md), [installer contract](./docs/installer.md), [Durable UI contract](./docs/durable-ui.md), [theming convention](./docs/theming.md), [Button contract](./docs/button.md), [native form markup contract](./docs/forms.md), and [Sailscasts docs contract](./docs/docs-site-plan.md).
