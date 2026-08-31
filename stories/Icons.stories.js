import { computed, ref } from "vue";
import { iconComponents, iconEntries, iconNames } from "./generated/icons.js";

const Rocket = iconComponents.Rocket;
const Search = iconComponents.Search;
const Server = iconComponents.Server;
const CheckCircle = iconComponents.CheckCircle;
const Copy = iconComponents.Copy;
const Trash = iconComponents.Trash;

const groupDefinitions = [
  {
    id: "shared",
    title: "Shared application language",
    description:
      "The actions, navigation, status, and content symbols used by both proving applications.",
    entries: iconEntries.filter(
      ({ applications }) => applications.length === 2,
    ),
  },
  {
    id: "hagfish",
    title: "Hagfish application set",
    description:
      "Billing, invoices, communication, identity, and expressive product workflows.",
    entries: iconEntries.filter(
      ({ applications }) =>
        applications.length === 1 && applications[0] === "hagfish",
    ),
  },
  {
    id: "slipway",
    title: "Slipway application set",
    description:
      "Infrastructure, navigation, developer tools, data, and operational controls.",
    entries: iconEntries.filter(
      ({ applications }) =>
        applications.length === 1 && applications[0] === "slipway",
    ),
  },
  {
    id: "signature",
    title: "Klean signature",
    description:
      "The redesigned Rocket remains Klean's launch mark even though neither current application needs it yet.",
    entries: iconEntries.filter(
      ({ applications }) => applications.length === 0,
    ),
  },
];

const meta = {
  title: "Components/Icons",
  component: Rocket,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Original 24×24 Klean geometry installed as framework-native source. Icons inherit currentColor and native SVG attributes; their semantic meaning remains with the surrounding button, link, label, or text.",
      },
    },
  },
  args: {
    icon: "Rocket",
    size: 24,
    color: "#111827",
    strokeWidth: 1.5,
  },
  argTypes: {
    icon: { control: "select", options: iconNames },
    size: { control: { type: "range", min: 12, max: 64, step: 1 } },
    color: { control: "color" },
    strokeWidth: {
      control: { type: "range", min: 1, max: 2.5, step: 0.25 },
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["icon", "size", "color", "strokeWidth"] },
  },
  render: (args) => ({
    components: iconComponents,
    setup() {
      return { args, iconComponents };
    },
    template: `
      <div class="grid min-h-44 min-w-72 place-items-center rounded-3xl bg-gray-50 p-10 shadow-sm dark:bg-gray-950">
        <component
          :is="iconComponents[args.icon]"
          :style="{ color: args.color, fontSize: args.size + 'px' }"
          :stroke-width="args.strokeWidth"
        />
      </div>
    `,
  }),
};

export const ProofSet = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: iconComponents,
    setup() {
      const query = ref("");
      const groups = computed(() => {
        const search = query.value.trim().toLowerCase();
        if (!search) return groupDefinitions;

        return groupDefinitions
          .map((group) => ({
            ...group,
            entries: group.entries.filter((icon) =>
              [icon.name, icon.description, ...icon.keywords]
                .join(" ")
                .toLowerCase()
                .includes(search),
            ),
          }))
          .filter(({ entries }) => entries.length);
      });

      const resultCount = computed(() =>
        groups.value.reduce((total, group) => total + group.entries.length, 0),
      );

      return { groups, query, resultCount };
    },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="icons-proof-title">
        <header class="max-w-4xl">
          <h1 id="icons-proof-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">The vocabulary our applications actually speak.</h1>
          <p class="mt-5 max-w-3xl text-pretty text-base leading-7 text-klean-muted">Ninety-seven audited product concepts, plus Klean's redesigned Rocket. Every drawing shares the same 24-pixel canvas, quiet 1.5 stroke, round joins, and enough breathing room to remain clear at interface size.</p>
        </header>

        <div class="mt-10 max-w-xl">
          <label for="icon-search" class="sr-only">Search icons</label>
          <div class="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm ring-1 ring-gray-950/10 focus-within:ring-2 focus-within:ring-gray-950 dark:bg-gray-950 dark:ring-white/10 dark:focus-within:ring-white">
            <Search class="size-5 shrink-0 text-klean-muted" />
            <input id="icon-search" v-model="query" type="search" class="min-w-0 flex-1 bg-transparent py-3 text-base outline-none" placeholder="Search by name or purpose" />
            <span class="text-sm tabular-nums text-klean-muted">{{ resultCount }}</span>
          </div>
        </div>

        <p v-if="!groups.length" class="mt-12 text-klean-muted">No Klean icon matches “{{ query }}”.</p>

        <section v-for="group in groups" :key="group.id" class="mt-16 max-w-screen-2xl" :aria-labelledby="group.id + '-title'">
          <div class="flex max-w-4xl flex-wrap items-baseline gap-x-4 gap-y-2">
            <h2 :id="group.id + '-title'" class="text-2xl font-semibold tracking-tight">{{ group.title }}</h2>
            <span class="text-sm tabular-nums text-klean-muted">{{ group.entries.length }} icons</span>
          </div>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-klean-muted">{{ group.description }}</p>
          <ul class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            <li v-for="icon in group.entries" :key="icon.name" class="grid min-w-0 justify-items-center gap-3 rounded-2xl bg-white px-3 py-5 text-center shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-950 dark:ring-white/10" :title="icon.description">
              <component :is="icon.component" class="size-6" />
              <p class="w-full truncate text-xs font-medium">{{ icon.name }}</p>
            </li>
          </ul>
        </section>
      </main>
    `,
  }),
};

export const DarkSurface = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: iconComponents,
    setup() {
      return { iconEntries };
    },
    template: `
      <main class="min-h-screen bg-gray-950 px-5 py-14 text-white sm:px-8 lg:px-12 lg:py-20" aria-labelledby="icons-dark-title">
        <header class="max-w-3xl">
          <h1 id="icons-dark-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Drawn with light, not filled with paint.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-gray-400">Every icon inherits currentColor, so the same source remains crisp across restrained operational surfaces and expressive product treatments.</p>
        </header>
        <ul class="mt-12 grid max-w-screen-2xl grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
          <li v-for="icon in iconEntries" :key="icon.name" class="grid aspect-square place-items-center rounded-2xl bg-white/5 text-gray-100 ring-1 ring-white/10" :title="icon.name">
            <component :is="icon.component" class="size-5" />
            <span class="sr-only">{{ icon.name }}</span>
          </li>
        </ul>
      </main>
    `,
  }),
};

export const OpticalSizes = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: iconComponents,
    setup() {
      return { iconEntries, sizes: [16, 20, 24] };
    },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="icons-sizes-title">
        <header class="max-w-3xl">
          <h1 id="icons-sizes-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Designed at the sizes people actually see.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">The geometry does not change between sizes. This board exposes weak corners, crowded counters, and optical drift before an icon reaches an application.</p>
        </header>

        <div class="mt-12 max-w-6xl overflow-x-auto rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-950 dark:ring-white/10 sm:p-8">
          <table class="w-full min-w-2xl border-separate border-spacing-y-5">
            <thead>
              <tr class="text-left text-xs font-medium uppercase tracking-wider text-klean-muted">
                <th scope="col" class="pb-2">Icon</th>
                <th v-for="size in sizes" :key="size" scope="col" class="pb-2 text-center">{{ size }}px</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="icon in iconEntries" :key="icon.name">
                <th scope="row" class="pr-8 text-left text-sm font-medium">{{ icon.name }}</th>
                <td v-for="size in sizes" :key="size" class="py-2 text-center">
                  <component :is="icon.component" :style="{ fontSize: size + 'px' }" class="inline-block" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    `,
  }),
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: iconComponents,
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="icons-apps-title">
        <header class="max-w-3xl">
          <h1 id="icons-apps-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Shared geometry. Unmistakably different products.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Klean owns the drawing. Hagfish and Slipway continue to own density, color, borders, shadows, focus, and motion.</p>
        </header>

        <div class="mt-12 grid max-w-7xl gap-10 xl:grid-cols-2">
          <section aria-labelledby="hagfish-icons-title">
            <h2 id="hagfish-icons-title" class="text-lg font-semibold">Hagfish invoice actions</h2>
            <div class="mt-4 rounded-xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000] dark:border-white dark:bg-gray-950 dark:shadow-[4px_4px_0_0_#fff]">
              <label for="hagfish-search" class="text-sm font-semibold">Find an invoice</label>
              <div class="mt-2 flex min-h-12 items-center gap-3 rounded-lg border-2 border-black px-4 focus-within:shadow-[3px_3px_0_0_#000] dark:border-white dark:focus-within:shadow-[3px_3px_0_0_#fff]">
                <Search class="size-5 shrink-0" />
                <input id="hagfish-search" class="min-w-0 flex-1 bg-transparent py-3 outline-none" placeholder="Invoice or client" />
              </div>
              <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-black bg-black px-4 text-sm font-medium text-white transition-all hover:bg-white hover:text-black hover:shadow-[3px_3px_0_0_#000] dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-950 dark:hover:text-white dark:hover:shadow-[3px_3px_0_0_#fff]">
                  <Copy class="size-4" /> Copy link
                </button>
                <button type="button" class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-red-600 px-4 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:shadow-[3px_3px_0_0_#dc2626] dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500/10">
                  <Trash class="size-4" /> Delete
                </button>
              </div>
            </div>
          </section>

          <section aria-labelledby="slipway-icons-title">
            <h2 id="slipway-icons-title" class="text-lg font-semibold">Slipway infrastructure</h2>
            <div class="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-950 dark:ring-white/10">
              <div class="flex items-center justify-between gap-4">
                <div class="flex min-w-0 items-center gap-3">
                  <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300"><Server class="size-5" /></span>
                  <div class="min-w-0"><p class="truncate text-sm font-medium">api-production</p><p class="mt-0.5 text-xs text-klean-muted">Lagos · healthy</p></div>
                </div>
                <button type="button" aria-label="Deploy api-production" class="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg bg-gray-950 text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100"><Rocket class="size-5" /></button>
              </div>
              <div class="mt-6 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                <CheckCircle class="size-4 text-emerald-600 dark:text-emerald-400" /> Latest deployment completed
              </div>
            </div>
          </section>
        </div>
      </main>
    `,
  }),
};
