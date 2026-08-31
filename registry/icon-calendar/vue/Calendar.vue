<script setup>
defineOptions({ inheritAttrs: false });
</script>

<template>
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
    v-bind="$attrs"
  >
    <rect x="3.75" y="5.5" width="16.5" height="14.25" rx="2.25" />
    <path d="M8 3.75v3.5M16 3.75v3.5M3.75 9.5h16.5" />
    <path
      d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01"
      stroke-width="2.25"
    />
  </svg>
</template>
