# Combobox

Combobox is Klean UI's editable search-and-choose control. It filters a long option list as someone types and can ask the application for remote results, while keeping the unfinished query separate from the committed value. Vue, React, and Svelte share one behavioral contract without sharing a runtime abstraction.

## Installation

```bash
npx klean-ui add combobox
```

Klean detects the Boring Stack application's framework and installs its native `Combobox` plus Klean `Popover`. There is no initializer, provider, configuration file, generated helper, framework questionnaire, or interaction-library runtime.

## Vue

```vue
<script setup>
import { ref } from "vue";
import Combobox from "@/components/ui/combobox/Combobox.vue";

const project = ref();
const projects = [
  { value: "slipway", label: "Slipway", keywords: ["deployments"] },
  { value: "hagfish", label: "Hagfish", keywords: ["billing"] },
];
</script>

<template>
  <label for="project">Project</label>
  <Combobox id="project" v-model="project" name="project" :options="projects" />
</template>
```

React uses `value` and `onValueChange`; Svelte uses `bind:value`. All three preserve string, number, and boolean values in application state.

## The boundary

- **Combobox** owns the editable query, local filtering, highlight, popup, and selection behavior.
- **Select** chooses from a known, reasonably short list without an editable input.
- **Input** accepts free text that does not have to match an option.
- **Menu** invokes actions or visits destinations.

Search is not a Select variant. Editable and select-only controls have different browser, keyboard, focus, and assistive-technology contracts.

## Option contract

```js
const options = [
  {
    value: "hagfish",
    label: "Hagfish",
    description: "Invoices and customers",
    keywords: ["billing", "payments"],
    group: "Products",
  },
];
```

`label`, `description`, and `keywords` participate in local matching. `keywords` supplies aliases without changing visible text. `disabled` keeps an option visible but removes it from pointer and keyboard selection. `group` adds an honest labelled group without creating part components.

## Remote search

Combobox emits its `search` callback after 300 ms when it opens and as the query changes. The opening query is empty, which lets the application provide a useful first page before someone types. The application owns the URL, credentials, pagination, response shape, and request lifecycle. Abort a replaced request and pass new `options`, `loading`, and `error` values back to the component.

```vue
<Combobox
  v-model="repository"
  :options="repositories"
  :loading="loading"
  :error="error"
  @search="searchRepositories"
/>
```

Existing results remain available while `loading` is true, so the popup does not disappear or jump while a refresh runs. The component replaces pending debounce timers and cleans them up on unmount; the application cancels the network request because only the application knows its transport policy.

## API

| Input                  | Default             | Purpose                                                                                |
| ---------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| value binding          | uncontrolled        | Vue `v-model`, React `value` and `onValueChange`, or Svelte `bind:value`.              |
| `defaultValue`         | —                   | Initial committed value for uncontrolled use.                                          |
| `options`              | `[]`                | Searchable choices in the conventional option shape.                                   |
| query binding          | uncontrolled        | Observe or control temporary query text only when application behavior needs it.       |
| `placeholder`          | `Search and choose` | Text shown while no value is committed.                                                |
| `loading` / `error`    | false / empty       | Application-owned remote search state.                                                 |
| search callback        | —                   | Receives the latest query after `searchDelay`.                                         |
| `searchDelay`          | `300`               | Debounce delay in milliseconds.                                                        |
| `name`                 | —                   | Submits the committed primitive value with an ordinary form.                           |
| `required`             | `false`             | Exposes the control's required relationship; server validation remains authoritative.  |
| `disabled`             | `false`             | Disables editing, opening, selection, and form submission.                             |
| open binding           | uncontrolled        | Observe or control visibility only when product behavior needs it.                     |
| `placement` / `offset` | bottom-start / 4    | Preferred logical placement and gap; viewport collision handling may flip or shift it. |
| `class` / `className`  | —                   | Ordinary Tailwind classes merged last onto the real editable input.                    |

Vue slots, React render functions, and Svelte snippets can replace option, empty, loading, and error rendering without changing selection semantics.

## Keyboard and focus contract

- Focus and click open the options while DOM focus stays on the editable input.
- Arrow Down and Arrow Up move between enabled filtered options; Home and End reach the enabled edges.
- `aria-activedescendant` exposes the visual highlight without moving focus into the popup.
- Enter commits the highlighted value once, closes, and restores the selected label.
- Escape abandons an unfinished query without changing the committed value.
- Tab closes and continues through the document normally. Combobox never traps focus.
- Pointer selection does not blur the input before committing.
- Outside interaction dismisses through Klean Popover light dismissal.

## Styling

Style the real input directly:

```vue
<Combobox
  v-model="customer"
  :options="customers"
  class="rounded-none border-x-0 border-t-0 border-dashed bg-transparent px-1 shadow-none"
/>
```

There are no `variant`, `tone`, `size`, `radius`, theme, or part-class props. Stable `data-slot` hooks cover the root, control, input, icon, content, listbox, group, option, indicator, empty, loading, and error surfaces. Repeated product treatments belong in application-owned components; copied source remains the final escape hatch.

## Durable state boundary

The selected value can be durable in a form, server record, shareable URL, or storage when the product calls for it. Query, open state, and highlight are ephemeral by default. Combobox does not write storage or URLs and it leaves no listener or pending debounce timer behind after unmount.

## Related components

- Select — a fixed non-editable choice.
- Input — unconstrained free text.
- Popover — ordinary floating content without selection semantics.
- Menu — actions and navigation.
- Dialog — a modal task boundary.
