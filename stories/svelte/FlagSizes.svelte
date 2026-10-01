<script>
  import Flag from "../../registry/flag/svelte/Flag.svelte";
</script>

<div class="flex items-center gap-4">
  {#each ["w-5", "w-6", "w-8", "w-10", "w-12"] as className}
    <Flag country="NG" class={className} />
  {/each}
</div>
