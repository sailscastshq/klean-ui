# Native form markup

Klean's form convention is visible HTML. Install the styled native control you need, then write the label, help, error, layout, and accessible relationships directly in the application.

```bash
npx klean-ui add input
npx klean-ui add textarea
```

There is no Field abstraction, field context, Label component, form store, initialization step, or generated configuration. Each command installs one framework-native source file for the detected framework.

## The recipe

```vue
<script setup>
import Input from "@/components/ui/input/Input.vue";
</script>

<template>
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
</template>
```

This is the convention over configuration: the browser's form model is the convention. `for` matches `id`, `name` controls submitted form data, and `required` remains native. Help and error nodes keep stable IDs, so `aria-describedby` never needs conditional string building. `aria-invalid="false"` is valid, and `empty:hidden` removes the empty error from the layout. When an error appears, the same relationship becomes useful automatically.

Do not add `role="alert"` to every inline error. When a failed submission needs announcement, use one application-owned form-level error summary and move focus to it; the stable inline messages remain descriptions for their controls.

## Ownership

The application owns:

- visible labels and messages;
- deterministic IDs and accessible relationships;
- validation timing and server errors;
- value binding, draft restoration, and form submission;
- layout and all visual customization through Tailwind.

Klean owns:

- neutral, accessible control defaults;
- native attribute forwarding;
- caller classes winning through `tailwind-merge`;
- framework-native value binding;
- Textarea height derived from its current value and responsive width.

Input and Textarea do not validate, format, debounce, announce submissions, or create a second persistence layer.

## Textarea durability

Textarea grows from the value it currently renders, including a value restored by server data, a URL, or an application-owned draft. It observes responsive width changes because wrapping changes height. It does not expose an `autoGrow` prop: derived presentation is the default contract.

Caller sizing remains ordinary Tailwind. A class such as `h-40 resize-y overflow-y-auto` replaces the derived height because caller classes are merged last.

## API

| Component  | Public API                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| `Input`    | native input attributes, framework-native value binding, caller classes    |
| `Textarea` | native textarea attributes, framework-native value binding, caller classes |

There are no visual variants, size presets, tone props, label props, description props, error props, or special Klean form aliases.
