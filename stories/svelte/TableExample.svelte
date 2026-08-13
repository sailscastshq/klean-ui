<script>
  import Table from "../../registry/table/svelte/Table.svelte";

  let { caption = "Production services", class: className = "min-w-lg" } =
    $props();

  const rows = [
    { service: "api", status: "Healthy", memory: "384 MB" },
    { service: "worker", status: "Deploying", memory: "192 MB" },
  ];
</script>

<div
  class="w-[min(92vw,42rem)] overflow-x-auto rounded-lg border border-gray-200"
>
  <Table class={className}>
    <caption class="caption-top px-4 py-3 text-left text-base font-semibold">
      {caption}
    </caption>
    <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
      <tr>
        <th scope="col" class="px-4 py-3 font-medium">Service</th>
        <th scope="col" class="px-4 py-3 font-medium">Status</th>
        <th scope="col" class="px-4 py-3 text-right font-medium">Memory</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      {#each rows as row (row.service)}
        <tr>
          <th scope="row" class="px-4 py-3 font-mono font-medium">
            {row.service}
          </th>
          <td class="px-4 py-3">{row.status}</td>
          <td class="px-4 py-3 text-right tabular-nums">{row.memory}</td>
        </tr>
      {/each}
    </tbody>
  </Table>
</div>
