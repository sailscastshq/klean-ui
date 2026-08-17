<script>
  import Separator from "../../registry/separator/svelte/Separator.svelte";

  let { orientation = "horizontal", class: className = "" } = $props();
</script>

<div
  class={orientation === "vertical"
    ? "flex h-32 items-stretch"
    : "w-[min(80vw,28rem)]"}
>
  <Separator {orientation} class={className} />
</div>
