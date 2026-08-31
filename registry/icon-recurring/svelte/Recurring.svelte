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
  <path d="M17.75 7.5H9a4.5 4.5 0 0 0-4.5 4.5v.5M15.25 5l2.5 2.5-2.5 2.5" />
  <path d="M6.25 16.5H15a4.5 4.5 0 0 0 4.5-4.5v-.5M8.75 14l-2.5 2.5 2.5 2.5" />
</svg>
