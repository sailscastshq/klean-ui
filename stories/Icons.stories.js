import Bell from "../src/vue/icons/Bell.vue";
import Calendar from "../src/vue/icons/Calendar.vue";
import CheckCircle from "../src/vue/icons/CheckCircle.vue";
import ChevronRight from "../src/vue/icons/ChevronRight.vue";
import Copy from "../src/vue/icons/Copy.vue";
import Folder from "../src/vue/icons/Folder.vue";
import Rocket from "../src/vue/icons/Rocket.vue";
import Search from "../src/vue/icons/Search.vue";
import Server from "../src/vue/icons/Server.vue";
import Trash from "../src/vue/icons/Trash.vue";
import User from "../src/vue/icons/User.vue";
import X from "../src/vue/icons/X.vue";

const iconComponents = {
  Trash,
  Search,
  Calendar,
  CheckCircle,
  X,
  ChevronRight,
  Copy,
  User,
  Folder,
  Server,
  Bell,
  Rocket,
};

const iconEntries = Object.entries(iconComponents).map(([name, component]) => ({
  name,
  component,
}));

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
    icon: { control: "select", options: Object.keys(iconComponents) },
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
      return { iconEntries };
    },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="icons-proof-title">
        <header class="max-w-3xl">
          <h1 id="icons-proof-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Twelve marks. One quiet voice.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Every drawing shares the same 24-pixel canvas, 1.5 stroke, round joins, and deliberate breathing room. They stay recognizable at interface size without becoming loud.</p>
        </header>

        <section class="mt-12 max-w-7xl" aria-labelledby="icons-light-title">
          <h2 id="icons-light-title" class="text-sm font-medium text-klean-muted">Light surface</h2>
          <ul class="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            <li v-for="icon in iconEntries" :key="icon.name" class="space-y-3">
              <div class="grid aspect-square max-w-32 place-items-center rounded-3xl bg-white text-gray-950 shadow-sm ring-1 ring-gray-950/5">
                <component :is="icon.component" class="size-6" />
              </div>
              <p class="text-sm font-medium">{{ icon.name }}</p>
            </li>
          </ul>
        </section>

        <section class="mt-16 max-w-7xl rounded-4xl bg-gray-950 px-5 py-8 text-white sm:px-8" aria-labelledby="icons-dark-title">
          <h2 id="icons-dark-title" class="text-sm font-medium text-gray-400">Dark surface</h2>
          <ul class="mt-6 grid grid-cols-3 gap-5 sm:grid-cols-6 lg:grid-cols-12">
            <li v-for="icon in iconEntries" :key="icon.name" class="grid place-items-center gap-3">
              <component :is="icon.component" class="size-6" />
              <span class="sr-only">{{ icon.name }}</span>
            </li>
          </ul>
        </section>
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
