import { expect, userEvent, within } from "storybook/test";
import { ref, watch } from "vue";
import Pagination from "../src/vue/pagination/Pagination.vue";

function interactive(args) {
  const current = ref(Number(args.page));

  watch(
    () => args.page,
    (page) => {
      current.value = Number(page);
    },
  );

  function navigate(event) {
    const link = event.target.closest?.("a[data-page]");
    if (!link) return;
    event.preventDefault();
    current.value = Number(link.dataset.page);
  }

  return { current, navigate };
}

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Durable server pagination for The Boring Stack. Pass the current page and page count; Klean derives real Inertia links from the current URL, preserves query state, uses push history, and keeps mobile navigation compact.",
      },
    },
  },
  args: {
    page: 4,
    pages: 12,
  },
  argTypes: {
    page: {
      control: { type: "number", min: 1, step: 1 },
      description: "Current page returned by the server.",
    },
    pages: {
      control: { type: "number", min: 1, step: 1 },
      description: "Total page count returned by the server.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["page", "pages"] } },
  render: (args) => ({
    components: { Pagination },
    setup() {
      return { args, ...interactive(args) };
    },
    template: `
      <div class="w-[min(92vw,46rem)]" @click.capture="navigate">
        <Pagination :page="current" :pages="args.pages" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: "Pagination" });

    await expect(navigation).toHaveAttribute("data-slot", "pagination");
    await userEvent.click(canvas.getByRole("link", { name: "Go to page 5" }));
    await expect(
      canvas.getByRole("link", { name: "Page 5, current page" }),
    ).toHaveAttribute("aria-current", "page");
  },
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Pagination },
    setup() {
      const states = ref({ first: 1, middle: 18, last: 36 });

      function navigate(event, name) {
        const link = event.target.closest?.("a[data-page]");
        if (!link) return;
        event.preventDefault();
        states.value[name] = Number(link.dataset.page);
      }

      return { navigate, states };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="pagination-states-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Server-owned state</p>
          <h1 id="pagination-states-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Edges tell the truth.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Unavailable directions are plain text, the current destination stays a link, and page discovery collapses without configuration.</p>
        </header>

        <div class="mt-12 grid max-w-5xl gap-5">
          <article v-for="(page, name) in states" :key="name" class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950" @click.capture="navigate($event, name)">
            <h2 class="mb-5 text-sm font-medium capitalize">{{ name }} page</h2>
            <Pagination :page="page" :pages="36" :aria-label="name + ' pagination'" />
          </article>
          <article class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <h2 class="text-sm font-medium">One page</h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">No navigation is rendered because there is nowhere to go.</p>
            <Pagination :page="1" :pages="1" aria-label="One-page pagination" />
          </article>
        </div>
      </section>
    `,
  }),
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Pagination },
    setup() {
      const bridgePage = ref(7);
      const invoicePage = ref(2);

      function navigate(event, state) {
        const link = event.target.closest?.("a[data-page]");
        if (!link) return;
        event.preventDefault();
        state.value = Number(link.dataset.page);
      }

      return { bridgePage, invoicePage, navigate };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="pagination-apps-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Application recipes</p>
          <h1 id="pagination-apps-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Same navigation. Product-owned finish.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Klean owns URLs and semantics. Slipway and Hagfish keep their visual identity through ordinary Tailwind on the copied source or stable data slots.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-8 xl:grid-cols-2">
          <article class="dark rounded-lg border border-gray-800 bg-gray-950 p-6 text-white shadow-xl" @click.capture="navigate($event, bridgePage)">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Slipway / Bridge resources</p>
            <div class="my-8 space-y-3">
              <div v-for="name in ['users', 'sessions', 'payments']" :key="name" class="rounded-md border border-gray-800 px-4 py-3 font-mono text-sm text-gray-300">{{ name }}</div>
            </div>
            <Pagination :page="bridgePage" :pages="24" :only="['records', 'pagination', 'filters']" aria-label="Bridge result pages" />
          </article>

          <article class="border-2 border-black bg-[#f7f3eb] p-6 text-black shadow-[6px_6px_0_0_#000] sm:p-8" @click.capture="navigate($event, invoicePage)">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-black/55">Hagfish / invoice archive</p>
            <div class="my-8 divide-y divide-black/20 border-y-2 border-black">
              <div v-for="invoice in ['INV-1042', 'INV-1041', 'INV-1040']" :key="invoice" class="flex justify-between py-4 font-medium">
                <span>{{ invoice }}</span><span>Paid</span>
              </div>
            </div>
            <Pagination
              :page="invoicePage"
              :pages="8"
              aria-label="Invoice archive pages"
              class="**:data-[slot=page]:rounded-none **:data-[slot=page]:border-black **:data-[slot=page]:text-black [&_[data-slot=page][data-state=current]]:bg-black [&_[data-slot=page][data-state=current]]:text-white"
            />
          </article>
        </div>
      </section>
    `,
  }),
};

export const Narrow = {
  parameters: {
    layout: "centered",
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => ({
    components: { Pagination },
    setup() {
      const current = ref(50);
      function navigate(event) {
        const link = event.target.closest?.("a[data-page]");
        if (!link) return;
        event.preventDefault();
        current.value = Number(link.dataset.page);
      }
      return { current, navigate };
    },
    template: `
      <div class="w-72 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950" @click.capture="navigate">
        <Pagination :page="current" :pages="100" aria-label="Compact result pages" />
      </div>
    `,
  }),
};
