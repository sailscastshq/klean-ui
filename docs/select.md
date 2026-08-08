# Select

Select is Klean UI's fixed-list value picker. It lets someone choose one persistent value from a known set while keeping primitive values typed in application state. It is a one-component API for Vue, React, and Svelte, with ordinary Tailwind styling and no required trigger, value, content, or item subcomponents.

## Installation

```bash
npx klean-ui add select
```

Klean detects the Boring Stack application's framework and installs its framework-native `Select` plus Klean `Popover`. There is no initializer, provider, configuration file, generated helper, framework questionnaire, or interaction-library runtime.

## Vue

```vue
<script setup>
import { ref } from "vue";
import Select from "@/components/ui/select/Select.vue";

const role = ref("viewer");
const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "administrator", label: "Administrator" },
];
</script>

<template>
  <label for="role">Member role</label>
  <Select id="role" v-model="role" name="role" :options="roles" />
</template>
```

React uses `value` and `onValueChange`; Svelte uses `bind:value`. All three accept the same option convention and preserve string, number, and boolean values in application state.

## The boundary

- **Select** chooses one persistent value from a known list.
- **Menu** invokes actions or visits destinations.
- **Combobox** owns an editable query, filtered or remote suggestions, loading and empty states, and stale-request cancellation.
- Native `<select>` remains the cleanest choice when its browser-owned popup and styling are sufficient.

Combobox will be a separate component. Select will not gain `searchable`, `filter`, `async`, or visual variant props.

## Option contract

```js
const options = [
  { value: "lagos", label: "Lagos", group: "Nigeria" },
  { value: "abuja", label: "Abuja", group: "Nigeria" },
  { value: "accra", label: "Accra", group: "Ghana" },
  { value: "kumasi", label: "Kumasi", group: "Ghana", disabled: true },
];
```

`value` may be a string, number, boolean, or any application value. Only primitive values can be serialized into native form submission. `label` supplies the default visible and accessible option name. `disabled` removes an option from pointer and keyboard selection. `group` adds an honest labelled group without introducing a second component API.

The placeholder describes an unselected control; it is never inserted as a fake selectable option.

## API

| Input | Default | Purpose |
| --- | --- | --- |
| value binding | uncontrolled | Vue `v-model`, React `value` and `onValueChange`, or Svelte `bind:value`. |
| `defaultValue` | — | Initial value for uncontrolled use. |
| `options` | `[]` | Fixed choices in the conventional option shape. |
| `placeholder` | `Select an option` | Text shown only when no option matches the value. |
| `name` | — | Submits the selected primitive value with an ordinary form. |
| `required` | `false` | Exposes the control's required relationship. Final validation remains application and server owned. |
| `disabled` | `false` | Disables opening, selection, and form submission. |
| `open` binding | uncontrolled | Observe or control visibility only when application behavior needs it. |
| `placement` | `bottom-start` | Preferred logical placement; collision handling may flip or shift it. |
| `offset` | `4` | Space in pixels between the trigger and list. |
| `class` / `className` | — | Ordinary Tailwind classes merged last onto the visible trigger. |

Vue exposes `value`, `option`, `icon`, and `empty` slots. React exposes equivalent render functions. Svelte exposes equivalent snippets. These hooks change rendering; they do not change semantics or interaction.

## Keyboard and focus contract

- Enter, Space, Arrow Down, or Arrow Up opens from the real trigger.
- Opening highlights the committed option, otherwise the first enabled option, without committing.
- Arrow Down and Arrow Up move between enabled options; Home and End reach the enabled edges.
- Printable characters provide buffered typeahead against accessible option labels.
- Enter or Space commits the highlighted value once, closes, and restores trigger focus.
- Escape cancels without changing the value and restores focus.
- Tab closes and continues through the document normally. Select never traps focus.
- Outside interaction dismisses without stealing focus from the selected destination.

The popup scrolls long lists, reveals the active option, matches at least the trigger width, and stays within the viewport. There is no animation by default.

## Styling

Style the visible control directly:

```vue
<Select
  v-model="status"
  :options="statuses"
  class="rounded-none border-2 border-black bg-white shadow-[4px_4px_0_0_#000]"
/>
```

There are no `variant`, `tone`, `size`, `radius`, theme, or part-class props. Stable `data-slot` hooks cover the trigger, value, icon, content, listbox, group, option, indicator, and empty state. State hooks include `data-state`, `data-placeholder`, `data-highlighted`, `data-selected`, `data-disabled`, and `data-invalid`. Repeated product treatments belong in application-owned components; the installed source remains the final escape hatch.

## Durable state boundary

The selected value may be durable when product requirements call for form, server, or URL persistence. Open state, highlight, and typeahead are ephemeral. Select does not write local storage, session storage, cookies, or URLs, and it leaves no interaction state behind after unmount.

## Related components

- Input — free-form text.
- Menu — actions and navigation.
- Popover — ordinary floating content in normal Tab order.
- Dialog — a modal task.
- Combobox — the separate upcoming component for editable search and async suggestions.
