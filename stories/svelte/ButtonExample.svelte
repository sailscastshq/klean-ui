<script>
  import Button from '../../registry/button/svelte/Button.svelte'

  let { label = 'Continue', disabled = false, onclick } = $props()
</script>

<Button {disabled} {onclick}>{label}</Button>
