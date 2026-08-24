<script>
  import Slide from "../../registry/slide/svelte/Slide.svelte";

  let {
    label = "Slide to continue",
    disabled = false,
    pending = false,
    class: className = "w-64",
    dir,
    onconfirm,
    productThumb = false,
  } = $props();
</script>

{#snippet thumb({ pending })}
  {#if pending}
    <span
      class="size-4 animate-spin rounded-full border-2 border-current border-e-transparent motion-reduce:animate-none"
    ></span>
  {/if}
{/snippet}

<Slide
  {disabled}
  {pending}
  class={className}
  {dir}
  {onconfirm}
  thumb={productThumb ? thumb : undefined}
>
  {label}
</Slide>
