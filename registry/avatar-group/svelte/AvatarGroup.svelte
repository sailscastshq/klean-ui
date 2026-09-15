<script>
  import { twMerge } from "tailwind-merge";
  import Avatar from "../avatar/Avatar.svelte";

  let {
    items = [],
    max = undefined,
    total = undefined,
    avatarClass = undefined,
    overflowClass = undefined,
    item: itemSnippet = undefined,
    overflow = undefined,
    class: className,
    "data-slot": _dataSlot,
    ...props
  } = $props();

  const ROOT_CLASSES = "flex items-center -space-x-2";
  const AVATAR_CLASSES = "ring-2 ring-white dark:ring-gray-950";
  const OVERFLOW_CLASSES =
    "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700 tabular-nums ring-2 ring-white select-none dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-950";

  let visible = $derived(
    Number.isInteger(max) && max >= 0 ? items.slice(0, max) : items,
  );
  let hidden = $derived(
    (Number.isFinite(total)
      ? Math.max(total, visible.length)
      : items.length) - visible.length,
  );

  function initials(alt = "") {
    return alt
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }
</script>

<div
  {...props}
  role="group"
  data-slot="avatar-group"
  class={twMerge(ROOT_CLASSES, className)}
>
  {#each visible as entry, index (entry.key ?? index)}
    {#if itemSnippet}
      {@render itemSnippet(entry, index)}
    {:else}
      <Avatar
        src={entry.src}
        alt={entry.alt ?? ""}
        class={twMerge(AVATAR_CLASSES, avatarClass)}
      >
        {entry.fallback ?? initials(entry.alt)}
      </Avatar>
    {/if}
  {/each}
  {#if hidden > 0}
    {#if overflow}
      {@render overflow(hidden)}
    {:else}
      <span
        role="img"
        data-slot="avatar-group-overflow"
        aria-label={`${hidden} more`}
        class={twMerge(OVERFLOW_CLASSES, overflowClass)}
      >
        +{hidden}
      </span>
    {/if}
  {/if}
</div>
