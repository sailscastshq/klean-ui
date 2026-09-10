<script>
  import Chips from "../../registry/chips/svelte/Chips.svelte";
  let value = $state(["Design", "Build"]);
</script>

<div class="w-80">
  <label for="chips-demo">Steps</label><Chips
    id="chips-demo"
    bind:value
    placeholder="Add value, press Enter"
    class="border-b border-dashed p-2"
  />
</div>
