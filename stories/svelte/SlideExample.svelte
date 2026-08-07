<script>
  import Slide from "../../registry/slide/svelte/Slide.svelte";

  let {
    label = "Slide to continue",
    disabled = false,
    pending = false,
    class: className = "w-64",
    dir,
    onconfirm,
  } = $props();
</script>

<Slide
  {disabled}
  {pending}
  class={className}
  {dir}
  {onconfirm}
>
  {label}
</Slide>
