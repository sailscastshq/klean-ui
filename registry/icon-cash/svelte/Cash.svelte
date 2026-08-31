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
  <rect x="3.5" y="6" width="17" height="12" rx="2" />
  <circle cx="12" cy="12" r="3" />
  <path d="M6.5 9.25h.01M17.5 14.75h.01" stroke-width="2" />
</svg>
