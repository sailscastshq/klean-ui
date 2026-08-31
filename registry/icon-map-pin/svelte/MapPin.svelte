<script>
  let { ...props } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="1em"
  height="1em"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
  data-slot="icon"
  {...props}
>
  <path d="M12 21c4-4.4 6-7.75 6-10.5a6 6 0 0 0-12 0C6 13.25 8 16.6 12 21" />
  <circle cx="12" cy="10.5" r="2.25" />
</svg>
