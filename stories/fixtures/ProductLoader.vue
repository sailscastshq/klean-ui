<template>
  <svg
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    data-product-loader=""
    class="product-loader h-5 w-5"
  >
    <path
      d="M7 17C7 3 25 3 25 17Z"
      fill="currentColor"
      fill-opacity="0.1"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-for="tentacle in tentacles"
      :key="tentacle.path"
      :class="tentacle.className"
      :d="tentacle.path"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
    />
    <circle cx="13" cy="11" r="1.8" fill="currentColor" />
    <ellipse
      class="product-loader-wink"
      cx="19"
      cy="11"
      rx="1.8"
      ry="1.8"
      fill="currentColor"
    />
  </svg>
</template>

<script setup>
const tentacles = [
  { className: "product-loader-t1", path: "M7 17C4 21 4 25 8 28" },
  { className: "product-loader-t2", path: "M12 17C11 21 10 25 13 28" },
  { className: "product-loader-t3", path: "M20 17C21 21 22 25 19 28" },
  { className: "product-loader-t4", path: "M25 17C28 21 28 25 24 28" },
];
</script>

<style>
.product-loader {
  animation: product-loader-bob 1.6s ease-in-out infinite;
}

.product-loader-t1,
.product-loader-t2,
.product-loader-t3,
.product-loader-t4 {
  transform-box: fill-box;
  transform-origin: top center;
}

.product-loader-t1,
.product-loader-t4 {
  animation: product-loader-sway-wide 1.8s ease-in-out infinite;
}

.product-loader-t2,
.product-loader-t3 {
  animation: product-loader-sway-narrow 1.4s ease-in-out infinite;
}

.product-loader-t2 {
  animation-delay: 0.1s;
}

.product-loader-t3 {
  animation-delay: 0.3s;
}

.product-loader-t4 {
  animation-delay: 0.45s;
}

.product-loader-wink {
  animation: product-loader-wink 4s ease-in-out infinite;
}

@keyframes product-loader-bob {
  50% {
    transform: translateY(-15%);
  }
}

@keyframes product-loader-sway-wide {
  25% {
    transform: rotate(18deg);
  }
  75% {
    transform: rotate(-18deg);
  }
}

@keyframes product-loader-sway-narrow {
  25% {
    transform: rotate(-12deg);
  }
  75% {
    transform: rotate(12deg);
  }
}

@keyframes product-loader-wink {
  0%,
  38%,
  42%,
  100% {
    ry: 1.8;
  }
  40% {
    ry: 0.2;
  }
}
</style>
