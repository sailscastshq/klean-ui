# Klean UI

Klean UI means Kelvin's Lean UI: source-owned, accessible UI for The Boring JavaScript Stack. It gives Vue, React, and Svelte applications framework-native components with neutral defaults, ordinary Tailwind styling, and Durable UI patterns. The source belongs to the application as soon as it is added.

## Add a component

Run the same command in every standard Boring Stack application:

```bash
npx klean-ui add button
npx klean-ui add input
npx klean-ui add textarea
npx klean-ui add checkbox
npx klean-ui add radio
npx klean-ui add switch
npx klean-ui add popover
npx klean-ui add menu
npx klean-ui add select
npx klean-ui add dialog
npx klean-ui add toast
```

Klean detects Sails and the frontend framework from `package.json` and the conventional application entry. It then installs the selected framework-native registry item and its prerequisites. Button is one source file:

```text
Vue      assets/js/components/ui/button/Button.vue
React    assets/js/components/ui/button/Button.jsx
Svelte   assets/js/components/ui/button/Button.svelte
```

Multi-file components remain conventional. Toast installs the detected renderer
and one framework-neutral controller beside it:

```text
Vue      assets/js/components/ui/toast/Toast.vue
React    assets/js/components/ui/toast/Toast.jsx
Svelte   assets/js/components/ui/toast/Toast.svelte
All      assets/js/components/ui/toast/toast.js
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

Read [the complete installation guide](https://docs.sailscasts.com/klean-ui/installation).

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
    :aria-invalid="Boolean(form.errors.email)"
    aria-describedby="email-help email-error"
  />
  <p id="email-help">We only use this for account messages.</p>
  <p id="email-error" class="empty:hidden text-sm text-red-700">
    {{ form.errors.email }}
  </p>
</div>
```

`aria-invalid="false"` is valid, and the stable empty error contributes no description. When an error appears, the same relationship becomes useful without conditional IDs or a Klean helper. Validation, IDs, messages, and values remain application-owned. Input and Textarea forward native attributes, while visual density, color, shape, and layout remain ordinary caller Tailwind classes. Read the canonical [Input documentation](https://docs.sailscasts.com/klean-ui/components/input).

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

Storybook opens one neutral workbench at `http://localhost:6006`. Its sidebar
composes three framework-native Storybooks:

```text
6006  Klean UI workbench
6007  Vue
6008  React
6009  Svelte
```

Open **Vue**, **React**, or **Svelte**, then choose **Components / Button**,
**Input**, **Textarea**, **Checkbox**, **Radio**, **Switch**, **Spinner**, **Popover**, **Menu**, **Select**, **Combobox**, **Dialog**, **Slide**, or **Toast**. The stories mount the actual
registry source and share behavior expectations without sharing a runtime
component abstraction. Controls stay limited to useful behavioral inputs;
interaction stories and the accessibility addon verify the durable contract.

`npm run build-storybook` produces the same composition as one static artifact:
the neutral shell at `storybook-static`, with each renderer nested below it.

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

The canonical documentation lives at [docs.sailscasts.com/klean-ui](https://docs.sailscasts.com/klean-ui/), including the [doctrine](https://docs.sailscasts.com/klean-ui/doctrine), [installation guide](https://docs.sailscasts.com/klean-ui/installation), [Durable UI contract](https://docs.sailscasts.com/klean-ui/durable-ui), [theming convention](https://docs.sailscasts.com/klean-ui/theming), and every [component page](https://docs.sailscasts.com/klean-ui/components/).
