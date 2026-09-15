<script setup>
import { computed, useAttrs } from "vue";
import { twMerge } from "tailwind-merge";
import Avatar from "../avatar/Avatar.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  /** People or identities to show, each `{ src, alt, fallback }`. */
  items: { type: Array, default: () => [] },
  /** How many avatars to show before the overflow count. Omit to show all. */
  max: { type: Number, default: undefined },
  /** The aggregate size when `items` is only part of a larger set. */
  total: { type: Number, default: undefined },
  /** Classes merged onto every avatar. */
  avatarClass: { type: String, default: undefined },
  /** Classes merged onto the overflow count. */
  overflowClass: { type: String, default: undefined },
});

const attrs = useAttrs();

const ROOT_CLASSES = "flex items-center -space-x-2";
const AVATAR_CLASSES = "ring-2 ring-white dark:ring-gray-950";
const OVERFLOW_CLASSES =
  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700 tabular-nums ring-2 ring-white select-none dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-950";

const visible = computed(() => {
  const items = props.items ?? [];
  return Number.isInteger(props.max) && props.max >= 0
    ? items.slice(0, props.max)
    : items;
});

const hidden = computed(() => {
  const size = Number.isFinite(props.total)
    ? Math.max(props.total, visible.value.length)
    : (props.items ?? []).length;
  return size - visible.value.length;
});

const rootAttrs = computed(() => {
  const { class: _class, "data-slot": _dataSlot, ...rest } = attrs;
  return rest;
});

function initials(alt = "") {
  return alt
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
</script>

<template>
  <div
    v-bind="rootAttrs"
    role="group"
    data-slot="avatar-group"
    :class="twMerge(ROOT_CLASSES, attrs.class)"
  >
    <template v-for="(item, index) in visible" :key="item.key ?? index">
      <slot name="item" :item="item" :index="index">
        <Avatar
          :src="item.src"
          :alt="item.alt ?? ''"
          :class="twMerge(AVATAR_CLASSES, avatarClass)"
        >
          {{ item.fallback ?? initials(item.alt) }}
        </Avatar>
      </slot>
    </template>
    <slot v-if="hidden > 0" name="overflow" :count="hidden">
      <span
        role="img"
        data-slot="avatar-group-overflow"
        :aria-label="`${hidden} more`"
        :class="twMerge(OVERFLOW_CLASSES, overflowClass)"
      >
        +{{ hidden }}
      </span>
    </slot>
  </div>
</template>
