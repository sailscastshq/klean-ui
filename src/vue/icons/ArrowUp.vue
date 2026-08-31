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
    <path d="M12 19.5v-14" />
    <path d="m6.75 10.75 5.25-5.25 5.25 5.25" />
  </svg>
</template>
