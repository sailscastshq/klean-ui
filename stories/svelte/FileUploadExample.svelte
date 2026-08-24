<script>
  import FileUpload from "../../registry/file-upload/svelte/FileUpload.svelte";

  let {
    accept = "image/png,image/jpeg,.pdf",
    disabled = false,
    maxKb = 2048,
  } = $props();

  let file = $state(null);
  let error = $state("");

  function formatSize(size) {
    if (size < 1024) return `${size} B`;
    return `${(size / 1024).toFixed(1)} KB`;
  }
</script>

<FileUpload
  bind:file
  {accept}
  {disabled}
  validate={(candidate) =>
    candidate.size <= maxKb * 1024
      ? true
      : `Choose a file under ${maxKb} KB.`}
  onchange={() => (error = "")}
  onreject={(detail) => (error = detail.message)}
  class="w-[min(38rem,calc(100vw-2rem))]"
>
  {#snippet children(upload)}
    <div
      {...upload.dropzone}
      class={`rounded-2xl border border-dashed bg-white p-8 text-center shadow-sm transition-colors duration-150 dark:bg-gray-950 motion-reduce:transition-none ${
        upload.dragging
          ? "border-gray-950 bg-gray-50 dark:border-white dark:bg-gray-900"
          : "border-gray-300 dark:border-gray-700"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <div
        class="mx-auto grid size-12 place-items-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          class="size-6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path
            d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15"
          /></svg
        >
      </div>
      <h2 class="mt-5 text-lg font-semibold tracking-tight">
        {upload.file ? "Ready to upload" : "Add a file"}
      </h2>
      <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
        Drop one file here, or use the native picker.
      </p>
      <button
        type="button"
        {disabled}
        class="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-gray-950 px-4 text-sm font-medium text-white outline-none hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white"
        onclick={upload.choose}
      >
        {upload.file ? "Replace file" : "Choose file"}
      </button>

      {#if upload.file}
        <div
          class="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-left dark:bg-gray-900"
        >
          <div
            class="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-gray-500 shadow-sm dark:bg-gray-950 dark:text-gray-400"
          >
            <span aria-hidden="true">↗</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{upload.file.name}</p>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {formatSize(upload.file.size)}
            </p>
          </div>
          <button
            type="button"
            class="min-h-10 cursor-pointer rounded-lg px-3 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:outline-white"
            onclick={upload.clear}
          >Remove</button
          >
        </div>
      {/if}
    </div>
    {#if error}
      <p role="alert" class="mt-3 text-sm text-red-700 dark:text-red-400">
        {error}
      </p>
    {/if}
  {/snippet}
</FileUpload>
