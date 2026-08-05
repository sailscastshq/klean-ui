<script>
  import { twMerge } from "tailwind-merge";
  import { getFieldContext } from "../field/field-context.js";

  let { for: htmlFor, class: className, children, ...props } = $props();
  const field = getFieldContext();
  let resolvedFor = $derived(field?.controlId ?? htmlFor);
</script>

<label
  {...props}
  for={resolvedFor}
  data-slot="label"
  data-disabled={field?.disabled ? "" : undefined}
  class={twMerge(
    "block text-sm font-medium leading-6 text-gray-950 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 dark:text-white",
    className,
  )}
>
  {@render children?.()}
</label>
