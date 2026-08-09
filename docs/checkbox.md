# Checkbox

Checkbox is Klean UI's native-first control for an independent yes/no value or membership in a set. Vue, React, and Svelte receive framework-native source with the same browser and accessibility outcome. The component does not turn Checkbox into Switch, Radio Group, a selectable card, or a destructive confirmation system.

## Install

```sh
npx klean-ui@latest add checkbox
```

Klean detects the Boring Stack application's framework and writes one source file to the conventional component directory. It installs `tailwind-merge` only when the application does not already declare it. There is no initializer, provider, configuration file, generated helper, framework questionnaire, or Klean runtime.

## The clean API

### Vue

```vue
<script setup>
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
</script>

<label class="flex cursor-pointer items-start gap-3">
  <Checkbox v-model="form.notifications" name="notifications" />
  <span>
    <span class="block font-medium">Deployment notifications</span>
    <span class="text-sm text-gray-500">Tell me when a deploy finishes.</span>
  </span>
</label>
```

Vue's normal checkbox `v-model` contract remains available, including array and `Set` membership plus `true-value` and `false-value`.

### React

```jsx
<label className="flex cursor-pointer items-start gap-3">
  <Checkbox
    checked={notifications}
    onChange={(event) => setNotifications(event.target.checked)}
    name="notifications"
  />
  <span>Deployment notifications</span>
</label>
```

React uses native `checked`, `defaultChecked`, and `onChange` rather than a Klean event vocabulary.

### Svelte

```svelte
<label class="flex cursor-pointer items-start gap-3">
  <Checkbox bind:checked={notifications} name="notifications" />
  <span>Deployment notifications</span>
</label>
```

Svelte uses its normal `bind:checked` contract and native event attributes.

## Why the label stays outside

The useful HTML is already the clean API. A real `<label>` can wrap Checkbox or target its `id`. It gives the control a visible accessible name and makes the full label area clickable. A description or error remains ordinary text linked with `aria-describedby`.

```vue
<div class="grid gap-2">
  <label for="legal" class="flex cursor-pointer items-start gap-3">
    <Checkbox
      id="legal"
      v-model="form.legal"
      name="legal"
      required
      :aria-invalid="Boolean(form.errors.legal)"
      aria-describedby="legal-help legal-error"
      class="mt-0.5"
    />
    <span>I have reviewed the information above.</span>
  </label>
  <p id="legal-help" class="text-sm text-gray-500">
    This confirmation is required before the transaction can continue.
  </p>
  <p id="legal-error" class="empty:hidden text-sm text-red-700">
    {{ form.errors.legal }}
  </p>
</div>
```

Checkbox does not guess validation timing or generate relationship IDs. The application supplies the same stable, inspectable markup used by Input and Textarea.

## Groups and collection membership

When several checkboxes answer one visible question, group them with `fieldset` and `legend`. Each checkbox still has its own label and value.

```vue
<fieldset class="space-y-3">
  <legend class="font-medium">Notify me about</legend>

  <label v-for="event in events" :key="event.value" class="flex cursor-pointer items-center gap-3">
    <Checkbox
      v-model="form.notifications"
      name="notifications"
      :value="event.value"
    />
    {{ event.label }}
  </label>
</fieldset>
```

The application receives the collection it asked for. Checkbox does not own a group store or introduce a `CheckboxGroup` abstraction.

## Indeterminate is presentation, not a third value

Use `indeterminate` for a parent selection control when some, but not all, children are checked.

```vue
<Checkbox
  :model-value="allSelected"
  :indeterminate="someSelected"
  aria-controls="row-one row-two row-three"
  @change="selectAll($event.target.checked)"
/>
```

The browser exposes this as a mixed accessible state. Activating it clears the partial presentation and produces an ordinary checked or unchecked value. `indeterminate` never becomes a third form value, so partial selection logic stays with the list that owns it.

## Native form behavior

- Space toggles the focused checkbox.
- Activating its label toggles it.
- `disabled` removes interaction and form submission.
- `required` participates in browser constraint validation.
- A checked checkbox submits its `name` and `value`; an unchecked checkbox submits nothing.
- Native form reset restores the initial checked state.
- `readonly` does not apply to checkboxes; use `disabled` when the value cannot be changed.

These are browser contracts, not event handlers recreated by Klean.

## Styling

The default is a neutral native checkbox using the current text color as its accent. Caller Tailwind classes merge last:

```vue
<!-- Compact Slipway control -->
<Checkbox class="size-3.5 text-white focus-visible:outline-white" />

<!-- Destructive confirmation -->
<Checkbox class="mt-0.5 text-red-600 focus-visible:outline-red-600" />

<!-- Hagfish's high-contrast treatment -->
<Checkbox class="text-black focus-visible:outline-black" />
```

A product may visually hide the native input and style its wrapping label with `has-[:checked]` or `peer-*` utilities. That is an application recipe, not a Checkbox variant. There are no `variant`, `tone`, `size`, indicator, label, or part-class props.

## Durable UI

Checkbox preserves native reset and form semantics, but it does not persist arbitrary booleans on its own. The owning form, server record, URL, or storage policy decides whether a value should survive navigation or reload. Indeterminate state is normally derived from the durable child selection rather than stored separately.

## Standards

- [HTML Standard: Checkbox state](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-(type=checkbox))
- [HTML Accessibility API Mappings: native checkbox](https://www.w3.org/TR/html-aam-1.0/#el-input-checkbox)
- [WAI form tutorial: grouping checkboxes](https://www.w3.org/WAI/tutorials/forms/grouping/#associating-related-controls-with-fieldset)

## Related components

- Input — free-form text rather than an independent checked value.
- Select — one choice from a longer fixed list.
- Button — an action rather than persistent form state.
- Switch — an immediate on/off setting; it does not support mixed state.
- Radio Group — one mutually exclusive choice from a small visible set.
