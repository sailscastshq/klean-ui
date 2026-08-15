<script>
  import Badge from "../../registry/badge/svelte/Badge.svelte";

  let { label = "Paid", class: className = "" } = $props();
</script>

<Badge class={className}>{label}</Badge>
