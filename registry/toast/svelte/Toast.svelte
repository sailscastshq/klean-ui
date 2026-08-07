<script>
  import { onMount } from "svelte";
  import { twMerge } from "tailwind-merge";
  import { toast } from "../toast.js";

  const POSITIONS = {
    "top-left": "left-4 top-4 items-start",
    "top-center": "left-1/2 top-4 -translate-x-1/2 items-center",
    "top-right": "right-4 top-4 items-end",
    "bottom-left": "bottom-4 left-4 items-start",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-right": "bottom-4 right-4 items-end",
  };

  const DIRECTIONS = {
    right: [
      "calc(100% + 1.25rem)", "0px", "-10px", "0px", "3px", "0px",
      "-8px", "0px", "calc(100% + 1.25rem)", "0px",
    ],
    left: [
      "calc(-100% - 1.25rem)", "0px", "10px", "0px", "-3px", "0px",
      "8px", "0px", "calc(-100% - 1.25rem)", "0px",
    ],
    top: [
      "0px", "calc(-100% - 1.25rem)", "0px", "10px", "0px", "-3px",
      "0px", "8px", "0px", "calc(-100% - 1.25rem)",
    ],
    bottom: [
      "0px", "calc(100% + 1.25rem)", "0px", "-10px", "0px", "3px",
      "0px", "-8px", "0px", "calc(100% + 1.25rem)",
    ],
    fade: Array(10).fill("0px"),
    none: Array(10).fill("0px"),
  };

  let {
    controller = toast,
    position = "top-right",
    from,
    to,
    label = "Notifications",
    class: className = "",
    style = "",
    children,
    ...viewportProps
  } = $props();

  let items = $state([]);
  let defaultDirection = $derived(position.endsWith("-left") ? "left" : "right");
  let resolvedFrom = $derived(from ?? defaultDirection);
  let resolvedTo = $derived(to ?? defaultDirection);
  let motionStyle = $derived.by(() => {
    const enter = DIRECTIONS[resolvedFrom] ?? DIRECTIONS.right;
    const leave = DIRECTIONS[resolvedTo] ?? DIRECTIONS.right;

    return [
      `--klean-toast-enter-x:${enter[0]}`,
      `--klean-toast-enter-y:${enter[1]}`,
      `--klean-toast-overshoot-x:${enter[2]}`,
      `--klean-toast-overshoot-y:${enter[3]}`,
      `--klean-toast-bounce-x:${enter[4]}`,
      `--klean-toast-bounce-y:${enter[5]}`,
      `--klean-toast-counter-x:${leave[6]}`,
      `--klean-toast-counter-y:${leave[7]}`,
      `--klean-toast-leave-x:${leave[8]}`,
      `--klean-toast-leave-y:${leave[9]}`,
      style,
    ].filter(Boolean).join(";");
  });

  function syncInstantMotion() {
    queueMicrotask(() => {
      for (const item of controller.getSnapshot()) {
        if (item.state === "entering" && resolvedFrom === "none") {
          controller.completeEnter(item.id);
        } else if (item.state === "closing" && resolvedTo === "none") {
          controller.remove(item.id);
        }
      }
    });
  }

  $effect(() => {
    const activeController = controller;
    const sync = () => {
      items = activeController.getSnapshot();
      syncInstantMotion();
    };

    sync();
    const unsubscribe = activeController.subscribe(sync);
    return unsubscribe;
  });

  function handleAnimationEnd(item, event) {
    if (event.target !== event.currentTarget) return;
    if (item.state === "entering") controller.completeEnter(item.id);
    else if (item.state === "closing") controller.remove(item.id);
  }

  function handleFocusOut(item, event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      controller.resume(item.id, "focus");
    }
  }

  onMount(() => {
    function handleVisibility() {
      if (document.hidden) controller.pauseAll("page-hidden");
      else controller.resumeAll("page-hidden");
    }
    function handleBlur() {
      controller.pauseAll("window-blur");
    }
    function handleFocus() {
      controller.resumeAll("window-blur");
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    handleVisibility();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      controller.resumeAll("page-hidden");
      controller.resumeAll("window-blur");
    };
  });
</script>

<section
  {...viewportProps}
  data-slot="toast-viewport"
  data-position={position}
  data-from={resolvedFrom}
  data-to={resolvedTo}
  aria-label={label}
  aria-live="polite"
  aria-atomic="false"
  aria-relevant="additions text"
  class={twMerge(
    "pointer-events-none fixed z-[100] m-0 flex w-[min(24rem,calc(100vw-2rem))] flex-col",
    POSITIONS[position],
    className,
  )}
  style={motionStyle}
>
  <ol data-slot="toast-list" class="m-0 flex w-full list-none flex-col p-0">
    {#each items as item (item.id)}
      <li
        data-klean-toast-row
        data-state={item.state}
        aria-atomic="true"
        class="grid grid-rows-[1fr] pb-3"
        onmouseenter={() => controller.pause(item.id, "hover")}
        onmouseleave={() => controller.resume(item.id, "hover")}
        onfocusin={() => controller.pause(item.id, "focus")}
        onfocusout={(event) => handleFocusOut(item, event)}
      >
        <div
          data-slot="toast"
          data-klean-toast-item
          data-state={item.state}
          data-from={resolvedFrom}
          data-to={resolvedTo}
          class={twMerge(
            "pointer-events-auto relative min-h-0 w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-4 text-gray-950 shadow-lg dark:border-gray-700 dark:bg-gray-950 dark:text-white",
            item.class,
            item.className,
          )}
          onanimationend={(event) => handleAnimationEnd(item, event)}
        >
          {#if children}
            {@render children({ item, dismiss: () => controller.dismiss(item.id) })}
          {:else}
            <div class="pr-8">
              {#if item.title}
                <p data-slot="toast-title" class="font-medium">{item.title}</p>
              {/if}
              {#if item.message}
                <p
                  data-slot="toast-message"
                  class={twMerge(
                    "text-sm leading-5 text-gray-600 dark:text-gray-300",
                    item.title && "mt-1",
                  )}
                >
                  {item.message}
                </p>
              {/if}
            </div>
            {#if item.dismissible !== false}
              <button
                type="button"
                data-slot="toast-dismiss"
                class="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded-md text-lg leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-gray-950"
                aria-label={item.dismissLabel ?? "Dismiss notification"}
                onclick={() => controller.dismiss(item.id)}
              >
                <span aria-hidden="true">×</span>
              </button>
            {/if}
          {/if}
        </div>
      </li>
    {/each}
  </ol>
</section>

<style>
  @keyframes klean-toast-enter {
    0% {
      opacity: 0;
      transform: translate3d(var(--klean-toast-enter-x), var(--klean-toast-enter-y), 0) scale(0.98);
    }
    62% {
      opacity: 1;
      transform: translate3d(var(--klean-toast-overshoot-x), var(--klean-toast-overshoot-y), 0) scale(1.01);
    }
    82% {
      transform: translate3d(var(--klean-toast-bounce-x), var(--klean-toast-bounce-y), 0) scale(0.997);
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
    24% {
      opacity: 1;
      transform: translate3d(var(--klean-toast-counter-x), var(--klean-toast-counter-y), 0) scale(1.005);
    }
    100% {
      opacity: 0;
      transform: translate3d(var(--klean-toast-leave-x), var(--klean-toast-leave-y), 0) scale(0.98);
    }
  }

  [data-klean-toast-item][data-state="entering"] {
    animation: klean-toast-enter 340ms cubic-bezier(0.2, 0.9, 0.18, 1) both;
  }

  [data-klean-toast-item][data-state="closing"] {
    animation: klean-toast-leave 300ms cubic-bezier(0.68, -0.16, 0.32, 1) both;
    pointer-events: none;
  }

  [data-klean-toast-row] {
    transition:
      grid-template-rows 320ms cubic-bezier(0.2, 0.9, 0.18, 1),
      padding-block-end 320ms cubic-bezier(0.2, 0.9, 0.18, 1);
  }

  [data-klean-toast-row][data-state="closing"] {
    grid-template-rows: 0fr;
    padding-block-end: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    [data-klean-toast-item][data-state] {
      animation-duration: 1ms;
      animation-timing-function: linear;
    }

    [data-klean-toast-row] {
      transition: none;
    }
  }
</style>
