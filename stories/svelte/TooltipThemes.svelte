<script>
  import Tooltip from "../../registry/tooltip/svelte/Tooltip.svelte";
</script>

<section
  class="grid min-h-136 md:grid-cols-2"
  aria-label="Tooltip theme defaults"
>
  <article class="grid place-items-center bg-white p-10 text-gray-950">
    <div class="grid justify-items-center gap-4">
      <p class="text-sm font-medium">Light application</p>
      <Tooltip text="Dark by default" placement="bottom">
        <button
          type="button"
          class="min-h-11 cursor-pointer rounded-md border border-gray-300 bg-white px-4 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
        >
          Focus or hover
        </button>
      </Tooltip>
    </div>
  </article>
  <article class="dark grid place-items-center bg-gray-950 p-10 text-white">
    <div class="grid justify-items-center gap-4">
      <p class="text-sm font-medium">Dark application</p>
      <Tooltip text="Light by default" placement="bottom">
        <button
          type="button"
          class="min-h-11 cursor-pointer rounded-md border border-gray-700 bg-gray-900 px-4 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Focus or hover
        </button>
      </Tooltip>
    </div>
  </article>
</section>
