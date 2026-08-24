<script>
  import FileUpload from "../../registry/file-upload/svelte/FileUpload.svelte";

  let file = $state(null);

  function formatSize(size) {
    if (size < 1024) return `${size} B`;
    return `${(size / 1024).toFixed(1)} KB`;
  }
</script>

<main class="min-h-svh bg-[#f7f3eb] px-5 py-14 text-gray-950 sm:px-8">
  <section
    class="mx-auto max-w-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
  >
    <h1 class="text-3xl font-semibold tracking-tight">Expense receipt</h1>
    <p class="mt-2 text-sm leading-6 text-gray-600">
      JPG, PNG, or PDF. The application still owns the upload request.
    </p>
    <FileUpload
      bind:file
      accept="image/jpeg,image/png,.pdf"
      capture="environment"
      class="mt-6"
    >
      {#snippet children(upload)}
        <div
          {...upload.dropzone}
          class={`border-2 border-dashed p-6 transition-colors duration-150 motion-reduce:transition-none ${
            upload.dragging
              ? "border-black bg-amber-50"
              : "border-gray-400 bg-gray-50"
          }`}
        >
          {#if upload.file}
            <div class="flex items-center gap-4">
              {#if upload.file.type.startsWith("image/")}
                <img
                  src={upload.previewUrl}
                  alt="Selected receipt preview"
                  class="size-20 shrink-0 border-2 border-black object-cover"
                />
              {:else}
                <div
                  class="grid size-20 shrink-0 place-items-center border-2 border-black bg-white font-mono text-sm font-semibold"
                >
                  PDF
                </div>
              {/if}
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium">{upload.file.name}</p>
                <p class="mt-1 text-sm text-gray-600">
                  {formatSize(upload.file.size)}
                </p>
              </div>
            </div>
          {:else}
            <div class="py-5 text-center">
              <p class="font-medium">Drop a receipt here</p>
              <p class="mt-1 text-sm text-gray-600">
                A real button remains the keyboard path.
              </p>
            </div>
          {/if}
          <div class="mt-5 flex justify-center gap-2">
            <button
              type="button"
              class="min-h-10 cursor-pointer border-2 border-black bg-black px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              onclick={upload.choose}
            >
              {upload.file ? "Replace receipt" : "Choose receipt"}
            </button>
            {#if upload.file}
              <button
                type="button"
                class="min-h-10 cursor-pointer border-2 border-black bg-white px-4 text-sm font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                onclick={upload.clear}
              >Remove</button
              >
            {/if}
          </div>
        </div>
      {/snippet}
    </FileUpload>
  </section>
</main>
