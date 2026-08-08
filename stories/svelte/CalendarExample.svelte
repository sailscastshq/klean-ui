<script>
  import Calendar from "../../registry/calendar/svelte/Calendar.svelte";

  let {
    value = "2026-08-12",
    min = "2026-08-01",
    max = "2026-12-31",
    locale = "en-NG",
    disabled = false,
    readonly = false,
    class: className = "",
  } = $props();
</script>

<Calendar bind:value {min} {max} {locale} {disabled} {readonly} class={className} />
