<script>
  import { twMerge } from "tailwind-merge";
  import Button from "../../registry/button/svelte/Button.svelte";

  const productButtonClasses =
    "min-h-12 rounded-full bg-violet-700 px-6 font-semibold text-white hover:bg-violet-800 focus-visible:outline-violet-600 dark:bg-violet-700 dark:text-white dark:hover:bg-violet-800";

  let { children, class: className, ...rest } = $props();
</script>

<Button {...rest} class={twMerge(productButtonClasses, className)}>
  {@render children?.()}
</Button>
