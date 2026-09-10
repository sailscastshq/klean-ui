<script>
  import { tick } from "svelte";
  import { twMerge } from "tailwind-merge";
  let {
    value = $bindable([]),
    onchange,
    normalizeValue = (value) => value.trim(),
    formatValue = (value) => value,
    maxItems = 100,
    disabled = false,
    readonly = false,
    required = false,
    class: className,
    onblur,
    ...attrs
  } = $props();
  let draft = $state(""),
    message = $state(""),
    input;
  const uid = $props.id();
  const errorId = `chips-${uid}-error`;
  function add() {
    if (disabled || readonly || !draft.trim()) return;
    try {
      const next = normalizeValue(draft);
      if (!next) throw new Error("Enter a value.");
      if (value.includes(next)) throw new Error("This value is already added.");
      if (value.length >= maxItems)
        throw new Error(`Use at most ${maxItems} values.`);
      value = [...value, next];
      onchange?.(value);
      draft = "";
      message = "";
      input?.setCustomValidity("");
    } catch (error) {
      message = error.message || "Enter a valid value.";
      input?.setCustomValidity(message);
    }
  }
  async function remove(index) {
    if (disabled || readonly) return;
    value = value.filter((_, i) => i !== index);
    onchange?.(value);
    message = "";
    input?.setCustomValidity("");
    await tick();
    input?.focus();
  }
</script>

<div
  data-slot="chips"
  class={twMerge("flex min-h-11 flex-wrap items-center gap-2", className)}
>
  {#each value as item, index (item)}
    <span
      data-slot="chip"
      class="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-950 dark:bg-gray-800 dark:text-white"
      ><span class="min-w-0 wrap-break-word">{formatValue(item)}</span
      >{#if !readonly}<button
          type="button"
          {disabled}
          aria-label={`Remove ${formatValue(item)}`}
          class="grid size-6 shrink-0 place-items-center rounded hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 dark:hover:bg-gray-700"
          onclick={() => remove(index)}>×</button
        >{/if}</span
    >
  {/each}
  <input
    {...attrs}
    bind:this={input}
    bind:value={draft}
    type="text"
    {disabled}
    {readonly}
    required={required && !value.length}
    aria-invalid={message ? "true" : attrs["aria-invalid"]}
    aria-describedby={[attrs["aria-describedby"], message && errorId]
      .filter(Boolean)
      .join(" ") || undefined}
    class="min-w-48 flex-1 border-0 bg-transparent py-1 text-sm outline-none disabled:cursor-not-allowed"
    oninput={() => {
      message = "";
      input?.setCustomValidity("");
    }}
    onkeydown={(e) => {
      if (e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        add();
      }
    }}
    onblur={(e) => {
      add();
      onblur?.(e);
    }}
  />
  {#if message}<span
      id={errorId}
      role="alert"
      class="w-full text-sm text-red-600 dark:text-red-400">{message}</span
    >{/if}
</div>
