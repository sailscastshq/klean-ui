# Field, Label, Input, and Textarea

Klean's form foundation is a small accessibility convention over native HTML. `Field` renders the real label and messages around a native `Input` or `Textarea`. `Label`, `Input`, and `Textarea` also remain independent primitives for forms that do not use Field.

```bash
npx klean-ui add field
```

The command installs Field, Label, Input, Textarea, and their small framework context for the detected framework. Individual primitives can also be added with `add label`, `add input`, or `add textarea`; each remains useful outside Field.

## Vue usage

```vue
<script setup>
import Field from "@/components/ui/field/Field.vue";
import Input from "@/components/ui/input/Input.vue";
</script>

<template>
  <Field
    name="email"
    label="Email address"
    description="We only use this for account messages."
    :error="form.errors.email"
    required
  >
    <Input v-model="form.email" type="email" autocomplete="email" />
  </Field>
</template>
```

Inside Field, the primitives use framework-native context to:

- generate one stable control ID and associate the label;
- inherit the native `name`, `required`, and `disabled` state;
- expose invalid state through `aria-invalid`;
- append description and error IDs to caller-supplied `aria-describedby` values.

Outside Field, Label, Input, and Textarea accept ordinary native attributes. There is no provider or global setup.

## Ownership boundary

Field does not validate, format, debounce, submit, or persist values. The application and server own those decisions. Validate after blur or submit rather than punishing untouched fields, and clear stale server errors as soon as editing makes them obsolete.

Field's error is ordinary descriptive text, not an individual live region. If a failed submission needs an announcement, render one form-level error summary, focus it, and link each entry to its control.

## Durable behavior

The primitives are durable without becoming a second form store. The application restores authoritative server data, URL state, or a local draft through its framework's normal value binding. Field then reconstructs the label, invalid state, description, and error relationship from those current inputs. Removing an error also removes its stale `aria-describedby` ID.

Textarea derives height from the current value on mount and after every value or responsive-width change. A restored draft therefore restores its presentation without Klean writing another localStorage record. Input and Textarea expose their native elements for explicit focus recovery after a failed submission.

## Visual API

There are no `variant`, `size`, `tone`, `orientation`, floating-label, or theme props. Use the framework's native class API:

```vue
<Input class="min-h-9 rounded-none border-2 py-1 text-sm shadow-none" />
```

Caller classes merge last with `tailwind-merge`. The neutral default is touch-safe, uses a 16px input font to avoid mobile zoom, keeps visible focus, and grows Textarea from its current value instead of showing the native resize handle. The height is derived again when a restored value or responsive width changes. Caller `h-*`, `max-h-*`, `overflow-y-auto`, or `resize-y` classes can take visual ownership without an `autoGrow` prop. Product density and styling stay with the application.

Field exposes stable `data-slot` anatomy when its internal label or messages need application-owned styling:

```vue
<Field
  label="Email"
  :error="form.errors.email"
  class="[&_[data-slot=label]]:sr-only [&_[data-slot=field-error]]:text-amber-700"
>
  <Input v-model="form.email" type="email" />
</Field>
```

## API

| Primitive  | Behavioral inputs                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `Field`    | `id`, `name`, `label`, `description`, `error`, `invalid`, `disabled`, `required`, native attrs |
| `Label`    | native `for` when standalone, native attrs, default slot                                       |
| `Input`    | native input attrs, framework-native value binding, caller class                               |
| `Textarea` | native textarea attrs, framework-native binding, caller class                                  |

Set the control ID on Field when an explicit ID is needed. This keeps the convention intact instead of repeating matching IDs on Label and Input.
