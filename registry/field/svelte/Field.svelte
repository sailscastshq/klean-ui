<script>
  import { twMerge } from "tailwind-merge";
  import { setFieldContext } from "./field-context.js";

  const LABEL_CLASSES =
    "block text-sm font-medium leading-6 text-gray-950 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 dark:text-white";

  let {
    id,
    name,
    label,
    description,
    error,
    invalid,
    disabled = false,
    required = false,
    class: className,
    children,
    ...props
  } = $props();

  const generatedId = $props.id();
  let controlId = $derived(id ?? generatedId);
  let descriptionId = $derived(`${controlId}-description`);
  let errorId = $derived(`${controlId}-error`);
  let resolvedInvalid = $derived(invalid ?? Boolean(error));
  let describedBy = $derived(
    [
      description !== undefined ? descriptionId : undefined,
      error !== undefined ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined,
  );

  setFieldContext({
    get controlId() {
      return controlId;
    },
    get name() {
      return name;
    },
    get invalid() {
      return resolvedInvalid;
    },
    get disabled() {
      return disabled;
    },
    get required() {
      return required;
    },
    get describedBy() {
      return describedBy;
    },
  });
</script>

<div
  {...props}
  data-slot="field"
  data-invalid={resolvedInvalid ? "" : undefined}
  data-disabled={disabled ? "" : undefined}
  class={twMerge("grid gap-2", className)}
>
  <label
    for={controlId}
    data-slot="label"
    data-disabled={disabled ? "" : undefined}
    class={LABEL_CLASSES}
  >
    {label}
  </label>
  {@render children?.()}
  {#if description !== undefined}
    <p
      id={descriptionId}
      data-slot="field-description"
      class="text-sm leading-6 text-gray-600 dark:text-gray-400"
    >
      {description}
    </p>
  {/if}
  {#if error !== undefined}
    <p
      id={errorId}
      data-slot="field-error"
      class="text-sm leading-6 text-red-700 dark:text-red-400"
    >
      {error}
    </p>
  {/if}
</div>
