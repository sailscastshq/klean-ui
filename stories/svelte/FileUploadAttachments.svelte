<script>
  import FileUpload from "../../registry/file-upload/svelte/FileUpload.svelte";

  let images = $state([]);
  let error = $state("");

  function signature(candidate) {
    return [
      candidate.name,
      candidate.size,
      candidate.type,
      candidate.lastModified,
    ].join(":");
  }

  function validateImage(candidate, { files }) {
    if (candidate.size > 5 * 1024 * 1024) {
      return "Each image must be 5 MB or smaller.";
    }
    if (files.some((file) => signature(file) === signature(candidate))) {
      return { reason: "duplicate", message: "That image is already attached." };
    }
    return files.length < 4 ? true : "Attach up to 4 images.";
  }
</script>

<main
  class="min-h-svh bg-gray-50 px-5 py-12 text-gray-950 dark:bg-gray-950 dark:text-white sm:px-8 lg:py-20"
>
  <section
    class="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
    aria-labelledby="attachments-title"
  >
    <h1 id="attachments-title" class="text-2xl font-semibold tracking-tight">
      Attach screenshots
    </h1>
    <p
      class="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400"
    >
      Add up to four images. Upload progress and persistence stay with the
      application.
    </p>

    <FileUpload
      bind:file={images}
      multiple
      accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
      validate={validateImage}
      onchange={() => (error = "")}
      onreject={(detail) => (error = detail.message)}
      class="mt-7"
    >
      {#snippet children(upload)}
        <div
          {...upload.dropzone}
          class={`rounded-xl border border-dashed p-5 transition-colors duration-150 motion-reduce:transition-none ${
            upload.dragging
              ? "border-gray-950 bg-gray-50 dark:border-white dark:bg-gray-800"
              : "border-gray-300 dark:border-gray-700"
          }`}
        >
          {#if upload.previews.length}
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {#each upload.previews as preview (`${preview.file.name}:${preview.file.lastModified}`)}
                <figure
                  class="group relative min-w-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    src={preview.previewUrl}
                    alt={preview.file.name}
                    class="aspect-square w-full object-cover"
                  />
                  <figcaption
                    class="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gray-950/80 px-2 py-1.5 text-white backdrop-blur-sm"
                  >
                    <span class="min-w-0 flex-1 truncate text-xs">
                      {preview.file.name}
                    </span>
                    <button
                      type="button"
                      class="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
                      aria-label={`Remove ${preview.file.name}`}
                      onclick={() => upload.remove(preview.file)}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </figcaption>
                </figure>
              {/each}
            </div>
          {/if}

          <div
            class={upload.previews.length
              ? "mt-5 flex flex-wrap items-center justify-between gap-3"
              : "py-8 text-center"}
          >
            <div class={upload.previews.length ? "" : "mx-auto"}>
              <p class="text-sm font-medium">
                {upload.previews.length
                  ? `${upload.files.length} of 4 attached`
                  : "Drop screenshots here"}
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                AVIF, GIF, JPEG, PNG, or WebP · 5 MB each
              </p>
            </div>
            <button
              type="button"
              class={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-gray-950 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white ${
                upload.previews.length ? "mt-0" : "mt-4"
              }`}
              onclick={upload.choose}
            >
              {upload.previews.length ? "Add more" : "Choose images"}
            </button>
          </div>
        </div>
        {#if error}
          <p
            role="alert"
            class="mt-3 text-sm font-medium text-red-700 dark:text-red-400"
          >
            {error}
          </p>
        {/if}
      {/snippet}
    </FileUpload>
  </section>
</main>
