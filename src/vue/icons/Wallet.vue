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
    <rect x="3.75" y="5.25" width="16.5" height="13.5" rx="2.25" />
    <path d="M3.75 8.5h14.5M14.75 10h5.5v4.75h-5.5a2.38 2.38 0 0 1 0-4.75Z" />
    <path d="M16.5 12.38h.01" stroke-width="2" />
  </svg>
</template>
