<script>
  import Alert from "../../registry/alert/svelte/Alert.svelte";

  let {
    as = "div",
    role = "",
    heading = "Changes are saved automatically",
    message = "You can leave this page and return whenever you are ready.",
    class: className = "",
  } = $props();
</script>

<Alert {as} role={role || undefined} class={className}>
  <h2 class="font-medium">{heading}</h2>
  <p class="mt-1 leading-6 text-gray-600 dark:text-gray-300">{message}</p>
</Alert>
