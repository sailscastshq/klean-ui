<script>
  import Checkbox from "../../registry/checkbox/svelte/Checkbox.svelte";
  import DataTable from "../../registry/data-table/svelte/DataTable.svelte";

  let {
    busy = false,
    class: className = "border-x border-b border-gray-800",
    tableClass = "min-w-180 text-gray-100 dark:text-gray-100",
  } = $props();

  const services = [
    { id: 1, service: "api", owner: "Platform", status: "Healthy", region: "fra1" },
    { id: 2, service: "worker", owner: "Billing", status: "Deploying", region: "iad1" },
    { id: 3, service: "mail", owner: "Growth", status: "Attention", region: "sin1" },
  ];
  let selected = $state([]);
  let search = $state("");
  let sort = $state("service ASC");
  let rows = $derived.by(() => {
    const query = search.trim().toLowerCase();
    const filtered = services.filter((row) =>
      [row.service, row.owner, row.status, row.region]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
    const [field, direction] = sort.split(" ");
    return filtered.toSorted((left, right) => {
      const result = String(left[field]).localeCompare(String(right[field]));
      return direction === "ASC" ? result : -result;
    });
  });

  function ariaSort(field) {
    const [active, direction] = sort.split(" ");
    if (active !== field) return undefined;
    return direction === "ASC" ? "ascending" : "descending";
  }

  function toggleSort(field) {
    const [active, direction] = sort.split(" ");
    sort = `${field} ${active === field && direction === "ASC" ? "DESC" : "ASC"}`;
  }
</script>

{#snippet tableContent(table)}
  <caption class="sr-only">Bridge service records</caption>
  <thead class="border-b border-gray-800 bg-gray-900 text-xs text-gray-400">
    <tr>
      <th scope="col" class="w-12 px-4 py-3">
        <Checkbox
          {...table.pageSelection("Select all services on this page")}
          class="text-white focus-visible:outline-white"
        />
      </th>
      <th scope="col" aria-sort={ariaSort("service")} class="px-4 py-3 text-left font-medium">
        <button type="button" class="cursor-pointer hover:text-white" onclick={() => toggleSort("service")}>Service ↕</button>
      </th>
      <th scope="col" class="px-4 py-3 text-left font-medium">Owner</th>
      <th scope="col" aria-sort={ariaSort("status")} class="px-4 py-3 text-left font-medium">
        <button type="button" class="cursor-pointer hover:text-white" onclick={() => toggleSort("status")}>Status ↕</button>
      </th>
      <th scope="col" class="px-4 py-3 text-left font-medium">Region</th>
      <th scope="col" class="w-16 px-4 py-3"><span class="sr-only">Actions</span></th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-900 bg-gray-950">
    {#if rows.length}
      {#each rows as row (row.id)}
        <tr class="hover:bg-white/5">
          <td class="px-4 py-3">
            <Checkbox
              {...table.rowSelection(row, `Select ${row.service}`)}
              class="text-white focus-visible:outline-white"
            />
          </td>
          <th scope="row" class="px-4 py-3 text-left font-medium"><a href={`#${row.id}`} class="text-white no-underline hover:underline">{row.service}</a></th>
          <td class="px-4 py-3 text-gray-300">{row.owner}</td>
          <td class="px-4 py-3">{row.status}</td>
          <td class="px-4 py-3 font-mono text-xs text-gray-400">{row.region}</td>
          <td class="px-4 py-3 text-right"><a href={`#actions-${row.id}`} aria-label={`Actions for ${row.service}`} class="inline-grid size-10 place-items-center text-gray-400 no-underline">⋯</a></td>
        </tr>
      {/each}
    {:else}
      <tr><td colspan="6" class="px-4 py-16 text-center text-sm text-gray-400">No matching services.</td></tr>
    {/if}
  </tbody>
{/snippet}

<section class="min-h-svh bg-gray-950 px-4 py-12 text-white sm:px-8">
  <div class="mx-auto max-w-5xl">
    <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Bridge services</h1>
        <p class="mt-2 text-sm text-gray-400">Native rows, durable server intent, application-owned cells.</p>
      </div>
      <a href="#new" class="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-gray-950 no-underline">New service</a>
    </header>

    <div class="mt-8 flex flex-col gap-3 border-y border-gray-800 py-4 sm:flex-row sm:items-center sm:justify-between">
      <input bind:value={search} type="search" aria-label="Search services" placeholder="Search services..." class="min-h-11 rounded-md border border-gray-700 bg-gray-900 px-3 text-base text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-72" />
      <span class="text-sm text-gray-400">{selected.length ? `${selected.length} selected · ` : ""}{rows.length} records</span>
    </div>

    <DataTable
      {rows}
      bind:selected
      {busy}
      class={className}
      {tableClass}
      children={tableContent}
    />
  </div>
</section>
