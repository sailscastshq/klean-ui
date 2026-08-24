import { expect, userEvent, within } from "storybook/test";
import { ref } from "vue";
import Button from "../src/vue/button/Button.vue";
import Sheet from "../src/vue/sheet/Sheet.vue";
import Sidebar from "../src/vue/sidebar/Sidebar.vue";

const AppNavigation = {
  props: { active: { type: String, default: "projects" } },
  emits: ["navigate"],
  template: `
    <nav aria-label="Workspace" class="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <ul class="grid gap-1 text-sm">
        <li v-for="item in [
          { value: 'projects', label: 'Projects', icon: '▣' },
          { value: 'deployments', label: 'Deployments', icon: '↗' },
          { value: 'lookout', label: 'Lookout', icon: '◉' },
          { value: 'settings', label: 'Settings', icon: '⌘' }
        ]" :key="item.value">
          <a
            :href="'#' + item.value"
            :aria-current="active === item.value ? 'page' : undefined"
            :class="[
              'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 no-underline transition-colors',
              active === item.value
                ? 'bg-gray-200 font-medium text-gray-950 dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white'
            ]"
            @click="$emit('navigate', item.value)"
          >
            <span aria-hidden="true" class="grid size-5 place-items-center text-xs">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>
  `,
};

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A durable native aside for persistent application navigation. The app owns real links, route state, authorization, and Tailwind; the existing native Sheet owns modal mobile navigation.",
      },
    },
  },
  args: {
    defaultOpen: true,
    remember: false,
    class: "w-64 data-[state=closed]:w-0 data-[state=closed]:opacity-0",
  },
  argTypes: {
    defaultOpen: { control: "boolean" },
    remember: {
      control: "boolean",
      description:
        "Remembers the choice using the sidebar id as its namespace.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind owns width, borders, color, and density.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["defaultOpen", "remember", "class"] },
  },
  render: (args) => ({
    components: { AppNavigation, Button, Sidebar },
    setup() {
      const sidebar = ref();
      const open = ref(args.defaultOpen);
      return { args, open, sidebar };
    },
    template: `
      <div class="klean-story-canvas flex min-h-136 overflow-hidden bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
        <Sidebar
          ref="sidebar"
          id="playground-sidebar"
          :default-open="args.defaultOpen"
          :remember="args.remember"
          :class="['border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950', args.class]"
          aria-label="Project navigation"
          @update:open="open = $event"
        >
          <div class="flex h-full w-64 flex-col">
            <div class="flex min-h-16 items-center gap-3 px-4">
              <span class="grid size-8 place-items-center rounded-lg bg-gray-950 text-xs font-semibold text-white dark:bg-white dark:text-gray-950">K</span>
              <strong class="text-sm">Klean workspace</strong>
            </div>
            <AppNavigation />
          </div>
        </Sidebar>

        <main id="main-content" class="min-w-0 flex-1 px-5 py-8 sm:px-8">
          <Button
            type="button"
            aria-controls="playground-sidebar"
            :aria-expanded="String(open)"
            class="bg-white text-gray-950 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-800"
            @click="sidebar.toggle()"
          >
            {{ open ? 'Hide navigation' : 'Show navigation' }}
          </Button>
          <h1 class="mt-12 text-4xl font-semibold tracking-[-0.04em]">The page keeps its space.</h1>
          <p class="mt-4 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400">The aside owns durable visibility. Everything inside it remains ordinary application markup.</p>
        </main>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", {
      name: "Hide navigation",
    });
    const sidebar = canvasElement.querySelector('[data-slot="sidebar"]');

    await expect(sidebar).toHaveAttribute("data-state", "open");
    await userEvent.click(trigger);
    await expect(sidebar).toHaveAttribute("data-state", "closed");
    await expect(sidebar).toHaveAttribute("aria-hidden", "true");
    await expect(sidebar).toHaveAttribute("inert");
    await expect(
      canvas.getByRole("button", { name: "Show navigation" }),
    ).toHaveAttribute("aria-expanded", "false");
  },
};

export const AppShell = {
  name: "App shell",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { AppNavigation, Button, Sheet, Sidebar },
    setup() {
      const active = ref("projects");
      const desktopOpen = ref(true);
      const desktopSidebar = ref();
      const mobileSheet = ref();

      function navigate(value) {
        active.value = value;
        mobileSheet.value?.close();
      }

      return {
        active,
        desktopOpen,
        desktopSidebar,
        mobileSheet,
        navigate,
      };
    },
    template: `
      <div class="klean-story-canvas flex h-svh min-h-152 overflow-hidden bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
        <a href="#sidebar-main" class="sr-only z-100 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-gray-950 focus:shadow-xl">Skip to content</a>

        <Sidebar
          ref="desktopSidebar"
          id="slipway-primary-sidebar"
          :remember="false"
          class="hidden w-60 border-r border-gray-200 bg-gray-50 data-[state=closed]:w-0 data-[state=closed]:opacity-0 dark:border-gray-800 dark:bg-gray-950 md:block"
          aria-label="Slipway navigation"
          @update:open="desktopOpen = $event"
        >
          <div class="flex h-full w-60 flex-col">
            <header class="flex min-h-16 items-center gap-3 px-4">
              <span class="grid size-8 place-items-center rounded-lg bg-gray-950 text-xs font-bold text-white dark:bg-white dark:text-gray-950">S</span>
              <div class="min-w-0"><strong class="block truncate text-sm">Slipway Labs</strong><span class="block text-xs text-gray-500">Production</span></div>
            </header>
            <AppNavigation :active="active" @navigate="navigate" />
            <footer class="border-t border-gray-200 p-3 dark:border-gray-800">
              <a href="#account" class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm no-underline hover:bg-gray-100 dark:hover:bg-gray-900"><span class="grid size-7 place-items-center rounded-md bg-gray-200 text-xs font-semibold dark:bg-gray-800">KO</span><span class="truncate">Kelvin</span></a>
            </footer>
          </div>
        </Sidebar>

        <main id="sidebar-main" class="min-w-0 flex-1 overflow-y-auto" tabindex="-1">
          <header class="sticky top-0 z-10 flex min-h-16 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90 sm:px-6">
            <Button commandfor="mobile-navigation" command="show-modal" aria-label="Open navigation" class="min-h-10 min-w-10 bg-transparent p-0 text-gray-700 hover:bg-gray-100 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900 md:hidden">
              <span aria-hidden="true">☰</span>
            </Button>
            <Button
              type="button"
              aria-controls="slipway-primary-sidebar"
              :aria-expanded="String(desktopOpen)"
              :aria-label="desktopOpen ? 'Hide navigation' : 'Show navigation'"
              class="hidden min-h-10 min-w-10 bg-transparent p-0 text-gray-700 hover:bg-gray-100 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900 md:inline-flex"
              @click="desktopSidebar.toggle()"
            ><span aria-hidden="true">◫</span></Button>
            <div><p class="text-xs text-gray-500">Projects</p><h1 class="font-semibold">Sailscasts API</h1></div>
            <span class="ml-auto rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Healthy</span>
          </header>

          <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <h2 class="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Deploy with confidence.</h2>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">Desktop navigation is persistent. Mobile navigation is a real modal Sheet. The application supplies the same navigation component to both.</p>
            <div class="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article v-for="service in ['web', 'worker', 'cron']" :key="service" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div class="flex items-center justify-between"><h3 class="font-medium">{{ service }}</h3><span class="size-2 rounded-full bg-emerald-500"><span class="sr-only">Running</span></span></div>
                <p class="mt-5 font-mono text-xs text-gray-500">fra · node 24 · main</p>
              </article>
            </div>
          </div>
        </main>

        <Sheet
          ref="mobileSheet"
          id="mobile-navigation"
          aria-labelledby="mobile-navigation-title"
          class="right-auto left-0 mr-auto ml-0 w-72 -translate-x-full border-r border-l-0 bg-gray-50 open:translate-x-0 starting:open:-translate-x-full dark:bg-gray-950 md:hidden"
        >
          <div class="flex h-full flex-col">
            <header class="flex min-h-16 items-center justify-between px-4">
              <h2 id="mobile-navigation-title" class="text-sm font-semibold">Slipway Labs</h2>
              <Button commandfor="mobile-navigation" command="request-close" autofocus aria-label="Close navigation" class="min-h-10 min-w-10 bg-transparent p-0 text-gray-600 hover:bg-gray-200 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"><span aria-hidden="true">×</span></Button>
            </header>
            <AppNavigation :active="active" @navigate="navigate" />
          </div>
        </Sheet>
      </div>
    `,
  }),
};
