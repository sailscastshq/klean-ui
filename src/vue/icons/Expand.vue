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
    <path
      d="M9.25 4.5H4.5v4.75M14.75 4.5h4.75v4.75M9.25 19.5H4.5v-4.75M14.75 19.5h4.75v-4.75"
    />
    <path
      d="m4.75 9 4.5-4.5M19.25 9l-4.5-4.5M4.75 15l4.5 4.5M19.25 15l-4.5 4.5"
    />
  </svg>
</template>
