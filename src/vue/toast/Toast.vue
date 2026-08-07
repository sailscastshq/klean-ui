<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
} from "vue";
import { twMerge } from "tailwind-merge";
import { toast } from "./toast.js";

defineOptions({ inheritAttrs: false });

const POSITIONS = {
  "top-left": "left-4 top-4 items-start",
  "top-center": "left-1/2 top-4 -translate-x-1/2 items-center",
  "top-right": "right-4 top-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
};

const DIRECTIONS = {
  right: {
    enterX: "calc(100% + 1.25rem)",
    enterY: "0px",
    overshootX: "-10px",
    overshootY: "0px",
    bounceX: "3px",
    bounceY: "0px",
    leaveX: "calc(100% + 1.25rem)",
    leaveY: "0px",
  },
  left: {
    enterX: "calc(-100% - 1.25rem)",
    enterY: "0px",
    overshootX: "10px",
    overshootY: "0px",
    bounceX: "-3px",
    bounceY: "0px",
    leaveX: "calc(-100% - 1.25rem)",
    leaveY: "0px",
  },
  top: {
    enterX: "0px",
    enterY: "calc(-100% - 1.25rem)",
    overshootX: "0px",
    overshootY: "10px",
    bounceX: "0px",
    bounceY: "-3px",
    leaveX: "0px",
    leaveY: "calc(-100% - 1.25rem)",
  },
  bottom: {
    enterX: "0px",
    enterY: "calc(100% + 1.25rem)",
    overshootX: "0px",
    overshootY: "-10px",
    bounceX: "0px",
    bounceY: "3px",
    leaveX: "0px",
    leaveY: "calc(100% + 1.25rem)",
  },
  fade: {
    enterX: "0px",
    enterY: "0px",
    overshootX: "0px",
    overshootY: "0px",
    bounceX: "0px",
    bounceY: "0px",
    leaveX: "0px",
    leaveY: "0px",
  },
  none: {
    enterX: "0px",
    enterY: "0px",
    overshootX: "0px",
    overshootY: "0px",
    bounceX: "0px",
    bounceY: "0px",
    leaveX: "0px",
    leaveY: "0px",
  },
};

const props = defineProps({
  /** Optional isolated controller. The shared `toast` works without a provider. */
  controller: { type: Function, default: undefined },
  /** Fixed viewport position. */
  position: {
    type: String,
    default: "top-right",
    validator: (value) =>
      [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ].includes(value),
  },
  /** Direction new notifications enter from. */
  from: {
    type: String,
    default: undefined,
    validator: (value) =>
      ["left", "right", "top", "bottom", "fade", "none"].includes(value),
  },
  /** Direction dismissed notifications leave toward. */
  to: {
    type: String,
    default: undefined,
    validator: (value) =>
      ["left", "right", "top", "bottom", "fade", "none"].includes(value),
  },
  /** Accessible name for the persistent live region. */
  label: { type: String, default: "Notifications" },
});

const attrs = useAttrs();
const items = ref([]);
const activeController = computed(() => props.controller ?? toast);
const defaultDirection = computed(() =>
  props.position.endsWith("-left") ? "left" : "right",
);
const resolvedFrom = computed(() => props.from ?? defaultDirection.value);
const resolvedTo = computed(() => props.to ?? defaultDirection.value);
let unsubscribe = () => {};

const viewportClasses = computed(() =>
  twMerge(
    "pointer-events-none fixed z-[100] m-0 flex w-[min(24rem,calc(100vw-2rem))] flex-col",
    POSITIONS[props.position],
    attrs.class,
  ),
);

const viewportAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    "aria-label": _ariaLabel,
    "aria-live": _ariaLive,
    "data-slot": _dataSlot,
    ...rest
  } = attrs;

  return rest;
});

const motionStyle = computed(() => {
  const enter = DIRECTIONS[resolvedFrom.value] ?? DIRECTIONS.right;
  const leave = DIRECTIONS[resolvedTo.value] ?? DIRECTIONS.right;

  return {
    "--klean-toast-enter-x": enter.enterX,
    "--klean-toast-enter-y": enter.enterY,
    "--klean-toast-overshoot-x": enter.overshootX,
    "--klean-toast-overshoot-y": enter.overshootY,
    "--klean-toast-bounce-x": enter.bounceX,
    "--klean-toast-bounce-y": enter.bounceY,
    "--klean-toast-leave-x": leave.leaveX,
    "--klean-toast-leave-y": leave.leaveY,
  };
});

function subscribe(controller) {
  unsubscribe();
  const sync = () => {
    items.value = controller.getSnapshot();

    if (resolvedFrom.value === "none" || resolvedTo.value === "none") {
      queueMicrotask(() => {
        for (const item of controller.getSnapshot()) {
          if (item.state === "entering" && resolvedFrom.value === "none") {
            controller.completeEnter(item.id);
          } else if (item.state === "closing" && resolvedTo.value === "none") {
            controller.remove(item.id);
          }
        }
      });
    }
  };

  sync();
  unsubscribe = controller.subscribe(sync);
}

function handleAnimationEnd(item, event) {
  if (event.target !== event.currentTarget) return;

  if (item.state === "entering") activeController.value.completeEnter(item.id);
  else if (item.state === "closing") activeController.value.remove(item.id);
}

function handleFocusOut(item, event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    activeController.value.resume(item.id, "focus");
  }
}

function handleVisibility() {
  if (document.hidden) activeController.value.pauseAll("page-hidden");
  else activeController.value.resumeAll("page-hidden");
}

function handleWindowBlur() {
  activeController.value.pauseAll("window-blur");
}

function handleWindowFocus() {
  activeController.value.resumeAll("window-blur");
}

watch(activeController, subscribe);

onMounted(() => {
  subscribe(activeController.value);
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("blur", handleWindowBlur);
  window.addEventListener("focus", handleWindowFocus);
  handleVisibility();
});

onBeforeUnmount(() => {
  unsubscribe();
  document.removeEventListener("visibilitychange", handleVisibility);
  window.removeEventListener("blur", handleWindowBlur);
  window.removeEventListener("focus", handleWindowFocus);
  activeController.value.resumeAll("page-hidden");
  activeController.value.resumeAll("window-blur");
});
</script>

<template>
  <section
    v-bind="viewportAttrs"
    data-slot="toast-viewport"
    :data-position="position"
    :data-from="resolvedFrom"
    :data-to="resolvedTo"
    :aria-label="label"
    aria-live="polite"
    aria-atomic="false"
    aria-relevant="additions text"
    :class="viewportClasses"
    :style="[motionStyle, attrs.style]"
  >
    <ol data-slot="toast-list" class="m-0 flex w-full list-none flex-col p-0">
      <li
        v-for="item in items"
        :key="item.id"
        data-klean-toast-row
        :data-state="item.state"
        aria-atomic="true"
        class="grid grid-rows-[1fr] pb-3"
        @mouseenter="activeController.pause(item.id, 'hover')"
        @mouseleave="activeController.resume(item.id, 'hover')"
        @focusin="activeController.pause(item.id, 'focus')"
        @focusout="handleFocusOut(item, $event)"
      >
        <div
          data-slot="toast"
          data-klean-toast-item
          :data-state="item.state"
          :data-from="resolvedFrom"
          :data-to="resolvedTo"
          :class="
            twMerge(
              'pointer-events-auto relative min-h-0 w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-4 text-gray-950 shadow-lg dark:border-gray-700 dark:bg-gray-950 dark:text-white',
              item.class,
            )
          "
          @animationend="handleAnimationEnd(item, $event)"
        >
          <slot :item="item" :dismiss="() => activeController.dismiss(item.id)">
            <div class="pr-8">
              <p v-if="item.title" data-slot="toast-title" class="font-medium">
                {{ item.title }}
              </p>
              <p
                v-if="item.message"
                data-slot="toast-message"
                :class="
                  twMerge(
                    'text-sm leading-5 text-gray-600 dark:text-gray-300',
                    item.title && 'mt-1',
                  )
                "
              >
                {{ item.message }}
              </p>
            </div>
            <button
              v-if="item.dismissible !== false"
              type="button"
              data-slot="toast-dismiss"
              class="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded-md text-lg leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-gray-950"
              :aria-label="item.dismissLabel ?? 'Dismiss notification'"
              @click="activeController.dismiss(item.id)"
            >
              <span aria-hidden="true">×</span>
            </button>
          </slot>
        </div>
      </li>
    </ol>
  </section>
</template>

<style>
@keyframes klean-toast-enter {
  0% {
    opacity: 0;
    transform: translate3d(
        var(--klean-toast-enter-x),
        var(--klean-toast-enter-y),
        0
      )
      scale(0.98);
  }
  62% {
    opacity: 1;
    transform: translate3d(
        var(--klean-toast-overshoot-x),
        var(--klean-toast-overshoot-y),
        0
      )
      scale(1.01);
  }
  82% {
    transform: translate3d(
        var(--klean-toast-bounce-x),
        var(--klean-toast-bounce-y),
        0
      )
      scale(0.997);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes klean-toast-leave {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate3d(
        var(--klean-toast-leave-x),
        var(--klean-toast-leave-y),
        0
      )
      scale(0.98);
  }
}

@keyframes klean-toast-collapse {
  0% {
    grid-template-rows: 1fr;
    padding-block-end: 0.75rem;
  }
  100% {
    grid-template-rows: 0fr;
    padding-block-end: 0;
  }
}

[data-klean-toast-item][data-state="entering"] {
  animation: klean-toast-enter 340ms cubic-bezier(0.2, 0.9, 0.18, 1) both;
}

[data-klean-toast-item][data-state="closing"] {
  animation: klean-toast-leave 240ms cubic-bezier(0.4, 0, 0.2, 1) both;
  pointer-events: none;
}

[data-klean-toast-row][data-state="closing"] {
  animation: klean-toast-collapse 160ms cubic-bezier(0.4, 0, 0.2, 1) 80ms both;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  [data-klean-toast-item][data-state] {
    animation-duration: 1ms;
    animation-timing-function: linear;
  }

  [data-klean-toast-row][data-state="closing"] {
    animation-delay: 0ms;
    animation-duration: 1ms;
  }
}
</style>
