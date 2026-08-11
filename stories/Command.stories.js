import { expect, userEvent, within } from "storybook/test";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import Button from "../src/vue/button/Button.vue";
import Command from "../src/vue/command/Command.vue";
import CommandEmpty from "../src/vue/command/CommandEmpty.vue";
import CommandGroup from "../src/vue/command/CommandGroup.vue";
import CommandInput from "../src/vue/command/CommandInput.vue";
import CommandItem from "../src/vue/command/CommandItem.vue";
import CommandList from "../src/vue/command/CommandList.vue";
import CommandSeparator from "../src/vue/command/CommandSeparator.vue";
import CommandShortcut from "../src/vue/command/CommandShortcut.vue";
import Dialog from "../src/vue/dialog/Dialog.vue";

const navigation = [
  {
    label: "Go to Projects",
    description: "View every application and service",
    keywords: ["dashboard", "apps"],
    shortcut: "G P",
    icon: "M3 7.5h7l2 2h9v9H3z M3 7.5v-2h7l2 2",
  },
  {
    label: "Go to Lookout",
    description: "Inspect metrics and recent incidents",
    keywords: ["monitoring", "metrics", "cpu", "memory"],
    shortcut: "G L",
    icon: "M4 18V9m5 9V5m5 13v-7m5 7V3",
  },
  {
    label: "Open Settings",
    description: "Manage this Slipway instance",
    keywords: ["preferences", "configuration"],
    shortcut: "G S",
    icon: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.57V20h-3v-.09a1.7 1.7 0 0 0-1.03-1.57 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 14.68a1.7 1.7 0 0 0-1.57-1.03H5v-3h.09A1.7 1.7 0 0 0 6.66 9.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 10.32 6a1.7 1.7 0 0 0 1.03-1.57V4h3v.09A1.7 1.7 0 0 0 15.4 5.66a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.57 1.03H21v3h-.09A1.7 1.7 0 0 0 19.4 15Z",
  },
];

const actions = [
  {
    label: "Deploy application",
    description: "Choose an application to deploy",
    keywords: ["ship", "release"],
    shortcut: "D",
    icon: "M15.5 14.5a6 6 0 0 1-6 6v-4m6-2A15 15 0 0 0 21 3a15 15 0 0 0-11.5 5.5m6 6a15 15 0 0 1-6 2m0-8a6 6 0 0 0-6 6h4m2-6a15 15 0 0 0-2 6m2 2 2.5 2.5 M16.5 8.5h.01",
  },
  {
    label: "Create project",
    description: "Start a new deployment workspace",
    keywords: ["new", "add"],
    shortcut: "N",
    icon: "M12 5v14M5 12h14",
  },
  {
    label: "Restart production",
    description: "Unavailable during the active deployment",
    keywords: ["reboot", "reload"],
    disabled: true,
    icon: "M20 7v5h-5 M4 17v-5h5 M6.1 9A7 7 0 0 1 18.7 7.2L20 12 M4 12l1.3 4.8A7 7 0 0 0 17.9 15",
  },
];

const commandComponents = {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};

const meta = {
  title: "Components/Command",
  component: Command,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A searchable command list for application actions. It keeps focus on one combobox input, leaves command data and navigation with the app, and composes directly inside native Dialog when a Cmd/Ctrl+K palette is useful.",
      },
    },
  },
  args: {
    query: "",
    placeholder: "Type a command or search…",
    class: "",
  },
  argTypes: {
    query: {
      control: "text",
      description: "Optional controlled search query.",
    },
    placeholder: {
      control: "text",
      description: "A direct prompt for the command search.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes merged onto Command.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["query", "placeholder", "class"] },
  },
  render: (args) => ({
    components: commandComponents,
    setup() {
      const query = ref(args.query);
      const selected = ref("Nothing yet");
      watch(
        () => args.query,
        (next) => (query.value = next),
      );
      return { actions, args, navigation, query, selected };
    },
    template: `
      <div class="grid w-[min(32rem,calc(100vw-2rem))] gap-3">
        <Command v-model:query="query" :class="args.class" @select="selected = $event">
          <CommandInput :placeholder="args.placeholder" aria-label="Application commands" />
          <CommandList aria-label="Available commands">
            <CommandEmpty>No matching command.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem
                v-for="item in navigation"
                :key="item.label"
                :value="item.label"
                :keywords="item.keywords"
              >
                <span class="min-w-0 flex-1">
                  <span class="block font-medium">{{ item.label }}</span>
                  <span class="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">{{ item.description }}</span>
                </span>
                <CommandShortcut>{{ item.shortcut }}</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem
                v-for="item in actions"
                :key="item.label"
                :value="item.label"
                :keywords="item.keywords"
                :disabled="item.disabled"
              >
                <span class="min-w-0 flex-1">
                  <span class="block font-medium">{{ item.label }}</span>
                  <span class="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">{{ item.description }}</span>
                </span>
                <CommandShortcut v-if="item.shortcut">{{ item.shortcut }}</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <p class="text-sm text-gray-500" aria-live="polite">Selected: {{ selected }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", {
      name: "Application commands",
    });

    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, "metrics");
    await expect(
      canvas.getByRole("option", { name: /Go to Lookout/ }),
    ).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Selected: Go to Lookout")).toBeVisible();
    await expect(input).toHaveFocus();
  },
};

export const Palette = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Dialog, ...commandComponents },
    setup() {
      const dialog = ref();
      const query = ref("");
      const selected = ref("Nothing yet");

      function run(value) {
        selected.value = value;
        query.value = "";
        dialog.value?.close();
      }

      function handleOpen(open) {
        if (open) query.value = "";
      }

      function handleShortcut(event) {
        if (
          (event.metaKey || event.ctrlKey) &&
          event.key.toLowerCase() === "k"
        ) {
          event.preventDefault();
          dialog.value?.showModal();
        }
      }

      onMounted(() => document.addEventListener("keydown", handleShortcut));
      onBeforeUnmount(() =>
        document.removeEventListener("keydown", handleShortcut),
      );

      return { actions, dialog, handleOpen, navigation, query, run, selected };
    },
    template: `
      <div class="grid justify-items-start gap-3">
        <Button commandfor="command-palette" command="show-modal">
          Open command palette
          <kbd aria-hidden="true" class="ml-3 rounded bg-white/15 px-1.5 py-0.5 text-xs">⌘ K</kbd>
        </Button>
        <p class="text-sm text-gray-500" aria-live="polite">Selected: {{ selected }}</p>

        <Dialog ref="dialog" id="command-palette" aria-label="Command palette" class="m-0 mx-auto mt-[20vh] max-w-lg rounded-xl border-0 bg-transparent p-0 shadow-none backdrop:bg-black/50 backdrop:backdrop-blur-sm" @update:open="handleOpen">
          <Command v-model:query="query" class="rounded-xl border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900" @select="run">
            <div class="flex items-center border-b border-gray-100 px-4 dark:border-gray-800">
              <svg aria-hidden="true" class="size-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" stroke-linecap="round" />
              </svg>
              <CommandInput autofocus aria-label="Search commands" class="border-0 px-3 py-3.5 text-sm focus-visible:outline-none" />
              <kbd aria-hidden="true" class="hidden shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:bg-gray-800 dark:text-gray-500 sm:inline">ESC</kbd>
            </div>
            <CommandList aria-label="Available commands" class="max-h-72 p-1.5">
              <CommandEmpty>No matching command.</CommandEmpty>
              <CommandGroup heading="Navigation">
                <CommandItem v-for="item in navigation" :key="item.label" :value="item.label" :keywords="item.keywords">
                  <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                    <svg aria-hidden="true" class="size-3.5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path :d="item.icon" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  </span>
                  <span class="flex min-w-0 flex-1 flex-col">
                    <span class="truncate">{{ item.label }}</span>
                    <span class="truncate text-xs text-gray-400 dark:text-gray-500">{{ item.description }}</span>
                  </span>
                  <CommandShortcut>{{ item.shortcut }}</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem v-for="item in actions" :key="item.label" :value="item.label" :keywords="item.keywords" :disabled="item.disabled">
                  <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                    <svg aria-hidden="true" class="size-3.5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path :d="item.icon" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  </span>
                  <span class="flex min-w-0 flex-1 flex-col">
                    <span class="truncate">{{ item.label }}</span>
                    <span class="truncate text-xs text-gray-400 dark:text-gray-500">{{ item.description }}</span>
                  </span>
                  <CommandShortcut v-if="item.shortcut">{{ item.shortcut }}</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
            <div class="flex items-center gap-4 border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
              <span class="flex items-center gap-1"><kbd class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">↑↓</kbd> navigate</span>
              <span class="flex items-center gap-1"><kbd class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">↵</kbd> select</span>
              <span class="flex items-center gap-1"><kbd class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">esc</kbd> close</span>
            </div>
          </Command>
        </Dialog>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: /Open command palette/,
    });
    await userEvent.click(trigger);
    const input = canvas.getByRole("combobox", { name: "Search commands" });
    await expect(input).toHaveFocus();
    await userEvent.type(input, "deploy");
    await userEvent.keyboard("{Enter}");
    await expect(
      canvas.getByText("Selected: Deploy application"),
    ).toBeVisible();
    await expect(trigger).toHaveFocus();
  },
};

export const NestedFlow = {
  name: "Nested flow",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: commandComponents,
    setup() {
      const level = ref("root");
      const query = ref("");
      const selected = ref("Nothing yet");
      const apps = ["Hagfish", "Docs", "Bearing"];

      function enterDeploy() {
        level.value = "deploy";
        query.value = "";
      }

      function back(event) {
        if (level.value === "root") return;
        event.preventDefault();
        level.value = "root";
        query.value = "";
      }

      function deploy(app) {
        selected.value = `Deploy ${app}`;
      }

      return { apps, back, deploy, enterDeploy, level, query, selected };
    },
    template: `
      <div class="grid w-[min(30rem,calc(100vw-2rem))] gap-3">
        <Command v-model:query="query" @escape="back" @back="back">
          <div class="flex items-center border-b border-gray-200 px-3 dark:border-gray-800">
            <button v-if="level !== 'root'" type="button" class="min-h-11 cursor-pointer pr-3 text-sm font-medium" @click="back($event)" aria-label="Back to all commands">←</button>
            <CommandInput :placeholder="level === 'root' ? 'Search commands' : 'Choose an application'" class="border-0 px-0 focus-visible:outline-none" aria-label="Nested commands" />
          </div>
          <CommandList aria-label="Available commands">
            <CommandEmpty>No matching command.</CommandEmpty>
            <CommandGroup v-if="level === 'root'" heading="Actions">
              <CommandItem value="Deploy application" :keywords="['ship', 'release']" @select="enterDeploy">
                <span class="font-medium">Deploy application</span>
                <span aria-hidden="true" class="ml-auto text-gray-400">→</span>
              </CommandItem>
              <CommandItem value="Open documentation"><span class="font-medium">Open documentation</span></CommandItem>
            </CommandGroup>
            <CommandGroup v-else heading="Applications">
              <CommandItem v-for="app in apps" :key="app" :value="app" @select="deploy(app)">
                <span class="font-medium">{{ app }}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <p class="text-sm text-gray-500" aria-live="polite">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

export const ProductRecipes = {
  name: "Products",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: commandComponents,
    setup() {
      return { actions, navigation };
    },
    template: `
      <main class="grid min-h-152 bg-gray-100 sm:grid-cols-2">
        <section class="flex items-center justify-center bg-gray-950 p-6 text-white sm:p-12" aria-labelledby="slipway-command-title">
          <div class="w-full max-w-md">
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-gray-400">Slipway / operations</p>
            <h2 id="slipway-command-title" class="mt-2 text-xl font-semibold">Move without leaving the keyboard</h2>
            <Command class="mt-6 rounded-md border-gray-700 bg-gray-900 text-white shadow-2xl">
              <CommandInput aria-label="Slipway commands" placeholder="Jump to or run…" class="min-h-10 border-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-white" />
              <CommandList class="max-h-64">
                <CommandEmpty>Nothing matches.</CommandEmpty>
                <CommandGroup heading="Navigation">
                  <CommandItem v-for="item in navigation.slice(0, 2)" :key="item.label" :value="item.label" :keywords="item.keywords" class="min-h-9 rounded px-2 py-1.5 text-sm dark:data-highlighted:bg-white/10">
                    <span>{{ item.label }}</span><CommandShortcut>{{ item.shortcut }}</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </section>

        <section class="flex items-center justify-center bg-[#f7f3eb] p-6 text-black sm:p-12" aria-labelledby="hagfish-command-title">
          <div class="w-full max-w-md">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-black/55">Hagfish / create</p>
            <h2 id="hagfish-command-title" class="mt-2 text-2xl font-semibold tracking-tight">What would you like to do?</h2>
            <Command class="mt-6 rounded-none border-2 border-black bg-white text-black shadow-[6px_6px_0_0_#000]">
              <CommandInput aria-label="Hagfish commands" placeholder="Search actions…" class="border-b-2 border-black px-4 text-black placeholder:text-black/45 focus-visible:outline-black" />
              <CommandList>
                <CommandEmpty class="text-black/60">No action found.</CommandEmpty>
                <CommandGroup heading="Invoices">
                  <CommandItem value="Create an invoice" :keywords="['bill', 'client']" class="rounded-none border-b border-black/10 px-4 data-highlighted:bg-[#fff3bf] data-highlighted:text-black dark:data-highlighted:bg-[#fff3bf] dark:data-highlighted:text-black">
                    <span class="font-semibold">Create an invoice</span><span aria-hidden="true" class="ml-auto">→</span>
                  </CommandItem>
                  <CommandItem value="Add a client" :keywords="['customer']" class="rounded-none px-4 data-highlighted:bg-[#fff3bf] data-highlighted:text-black dark:data-highlighted:bg-[#fff3bf] dark:data-highlighted:text-black">
                    <span class="font-semibold">Add a client</span><span aria-hidden="true" class="ml-auto">→</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </section>
      </main>
    `,
  }),
};
