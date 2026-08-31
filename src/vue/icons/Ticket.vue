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
      d="M4 6.25h16v3a2.75 2.75 0 0 0 0 5.5v3H4v-3a2.75 2.75 0 0 0 0-5.5z"
    />
    <path d="M9 7.75v1M9 11.5v1M9 15.25v1" />
  </svg>
</template>
