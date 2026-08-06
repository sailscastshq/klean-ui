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
      :aria-invalid="!!form.errors.email"
      :aria-describedby="
        form.errors.email ? 'email-help email-error' : 'email-help'
      "
    />
    <p id="email-help">We only use this for account messages.</p>
    <p v-if="form.errors.email" id="email-error">
      {{ form.errors.email }}
    </p>
  </div>
</template>
```

This is the convention over configuration: the browser's form model is the convention. `for` matches `id`, `name` controls submitted form data, `required` remains native, and the application adds or removes the error ID from `aria-describedby` with the error itself. When help and error are both visible, both IDs are described.

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

Input and Textarea do not validate, format, debounce, announce submissions, or create a second persistence layer. A failed submission that needs announcement should use one application-owned form error summary, focus it, and link its entries to the affected controls.

## Textarea durability

Textarea grows from the value it currently renders, including a value restored by server data, a URL, or an application-owned draft. It observes responsive width changes because wrapping changes height. It does not expose an `autoGrow` prop: derived presentation is the default contract.

Caller sizing remains ordinary Tailwind. A class such as `h-40 resize-y overflow-y-auto` replaces the derived height because caller classes are merged last.

## API

| Component  | Public API                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| `Input`    | native input attributes, framework-native value binding, caller classes    |
| `Textarea` | native textarea attributes, framework-native value binding, caller classes |

There are no visual variants, size presets, tone props, label props, description props, error props, or special Klean form aliases.
