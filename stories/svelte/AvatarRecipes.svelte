<script>
  import Avatar from "../../registry/avatar/svelte/Avatar.svelte";
  import { avatarImages } from "../shared/avatar-images.js";
</script>

<div class="grid w-[min(42rem,90vw)] gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
  <a
    href="#profile"
    class="flex items-center gap-3 rounded-lg p-2 no-underline hover:bg-gray-50 dark:hover:bg-gray-900"
  >
    <Avatar src={avatarImages.kelvin} alt="" class="size-11">KO</Avatar>
    <span>
      <strong class="block text-sm">Kelvin Omereshone</strong>
      <span class="text-xs text-gray-500 dark:text-gray-400">Creator account</span>
    </span>
  </a>
  <button
    type="button"
    class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-left hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
  >
    <Avatar src="" alt="" class="size-7 rounded-md bg-gray-950 text-xs text-white dark:bg-white dark:text-gray-950">SW</Avatar>
    <span class="text-sm font-medium">Slipway</span>
    <span aria-hidden="true" class="ml-auto">⌄</span>
  </button>
</div>
