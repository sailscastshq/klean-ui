import { expect, userEvent, within } from "storybook/test";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Button from "../src/vue/button/Button.vue";
import Command from "../src/vue/command/Command.vue";
import Dialog from "../src/vue/dialog/Dialog.vue";

const navigation = [
  {
    id: "nav.projects",
    title: "Go to Projects",
    subtitle: "View every application and service",
    keywords: ["dashboard", "apps"],
    group: "Navigation",
    shortcut: "G P",
    icon: "M3 7.5h7l2 2h9v9H3z M3 7.5v-2h7l2 2",
  },
  {
    id: "nav.lookout",
    title: "Go to Lookout",
    subtitle: "Inspect metrics and recent incidents",
    keywords: ["monitoring", "metrics", "cpu", "memory"],
    group: "Navigation",
    shortcut: "G L",
    icon: "M4 18V9m5 9V5m5 13v-7m5 7V3",
  },
  {
    id: "nav.settings",
    title: "Open Settings",
    subtitle: "Manage this workspace",
    keywords: ["preferences", "configuration"],
    group: "Navigation",
    shortcut: "G S",
    icon: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  },
];

const actions = [
  {
    id: "action.deploy",
    title: "Deploy application",
    subtitle: "Choose an application to deploy",
    keywords: ["ship", "release"],
    group: "Actions",
    shortcut: "D",
    icon: "M15.5 14.5a6 6 0 0 1-6 6v-4m6-2A15 15 0 0 0 21 3a15 15 0 0 0-11.5 5.5m6 6a15 15 0 0 1-6 2m0-8a6 6 0 0 0-6 6h4m2-6a15 15 0 0 0-2 6m2 2 2.5 2.5",
  },
  {
    id: "action.create",
    title: "Create project",
    subtitle: "Start a new deployment workspace",
    keywords: ["new", "add"],
    group: "Actions",
    shortcut: "N",
    icon: "M12 5v14M5 12h14",
  },
  {
    id: "action.restart",
    title: "Restart production",
    subtitle: "Unavailable during the active deployment",
    keywords: ["reboot", "reload"],
    group: "Actions",
    disabled: true,
    destructive: true,
    icon: "M20 7v5h-5 M4 17v-5h5 M6.1 9A7 7 0 0 1 18.7 7.2L20 12",
  },
];

const commands = [...navigation, ...actions];

const meta = {
  title: "Components/Command",
  component: Command,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One searchable command component. Pass ordinary command records; Klean renders the accessible input, grouped list, empty state, and keyboard contract. Advanced apps can pass their existing grouped results and keep ranking, history, nested flows, actions, and styling in application source.",
      },
    },
  },
  args: {
    query: "",
    placeholder: "Type a command or search…",
    class: "",
  },
  argTypes: {
    query: { control: "text", description: "Optional controlled query." },
    placeholder: { control: "text", description: "Search prompt." },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes merged onto Command.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["query", "placeholder", "class"] } },
  render: (args) => ({
    components: { Command },
    setup() {
      const query = ref(args.query);
      const selected = ref("Nothing yet");
      watch(
        () => args.query,
        (next) => (query.value = next),
      );
      return { args, commands, query, selected };
    },
    template: `
      <div class="grid w-[min(32rem,calc(100vw-2rem))] gap-3">
        <Command
          v-model:query="query"
          :commands="commands"
          :class="args.class"
          :placeholder="args.placeholder"
          label="Application commands"
          @select="selected = $event.title"
        />
        <p class="text-sm text-gray-500" aria-live="polite">Selected: {{ selected }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", {
      name: "Application commands",
    });
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
    components: { Button, Command, Dialog },
    setup() {
      const dialog = ref();
      const query = ref("");
      const selected = ref("Nothing yet");

      function run(command) {
        selected.value = command.title;
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
      return { commands, dialog, handleOpen, query, run, selected };
    },
    template: `
      <div class="grid justify-items-start gap-3">
        <Button commandfor="command-palette" command="show-modal">
          Open command palette
          <kbd aria-hidden="true" class="ml-3 rounded bg-white/15 px-1.5 py-0.5 text-xs">⌘ K</kbd>
        </Button>
        <p class="text-sm text-gray-500" aria-live="polite">Selected: {{ selected }}</p>

        <Dialog ref="dialog" id="command-palette" aria-label="Command palette" class="m-0 mx-auto mt-[20vh] max-w-lg rounded-xl border-0 bg-transparent p-0 shadow-none backdrop:bg-black/50 backdrop:backdrop-blur-sm" @update:open="handleOpen">
          <Command v-model:query="query" :commands="commands" autofocus label="Search commands" class="rounded-xl border-gray-200 bg-white shadow-2xl **:data-[slot=command-input]:px-3 dark:border-gray-700 dark:bg-gray-900" @select="run">
            <template #prefix>
              <svg aria-hidden="true" class="size-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" stroke-linecap="round" /></svg>
            </template>
            <template #suffix>
              <kbd aria-hidden="true" class="hidden shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:bg-gray-800 dark:text-gray-500 sm:inline">ESC</kbd>
            </template>
            <template #item="{ command }">
              <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                <svg aria-hidden="true" class="size-3.5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path :d="command.icon" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate">{{ command.title }}</span>
                <span class="truncate text-xs text-gray-400 dark:text-gray-500">{{ command.subtitle }}</span>
              </span>
              <kbd v-if="command.shortcut" aria-hidden="true" class="ml-auto shrink-0 font-mono text-xs text-gray-500 dark:text-gray-400">{{ command.shortcut }}</kbd>
            </template>
            <template #footer>
              <div class="flex items-center gap-4 border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
                <span class="flex items-center gap-1"><kbd class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">↑↓</kbd> navigate</span>
                <span class="flex items-center gap-1"><kbd class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">↵</kbd> select</span>
                <span class="flex items-center gap-1"><kbd class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">esc</kbd> close</span>
              </div>
            </template>
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

export const GroupedResults = {
  name: "Grouped results",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Command },
    setup() {
      const query = ref("");
      const selected = ref("Nothing yet");
      const groups = computed(() => ({
        Recent: [actions[0]],
        Navigation: navigation,
        Actions: actions.slice(1),
      }));
      return { groups, query, selected };
    },
    template: `
      <div class="grid w-[min(32rem,calc(100vw-2rem))] gap-3">
        <Command v-model:query="query" :groups="groups" label="Ranked application commands" @select="selected = $event.title" />
        <p class="text-sm text-gray-500" aria-live="polite">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

export const NestedFlow = {
  name: "Nested flow",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Command },
    setup() {
      const level = ref("root");
      const query = ref("");
      const selected = ref("Nothing yet");
      const apps = ["Storefront", "Docs", "Worker"].map((title) => ({
        id: `app.${title.toLowerCase()}`,
        title,
        group: "Applications",
      }));
      const rootCommands = [
        {
          id: "action.deploy",
          title: "Deploy application",
          keywords: ["ship", "release"],
          group: "Actions",
          children: () => apps,
        },
        { id: "action.docs", title: "Open documentation", group: "Actions" },
      ];
      const currentCommands = computed(() =>
        level.value === "root" ? rootCommands : apps,
      );

      function back(event) {
        if (level.value === "root") return;
        event?.preventDefault();
        level.value = "root";
        query.value = "";
      }
      function run(command) {
        if (command.children) {
          level.value = "deploy";
          query.value = "";
        } else {
          selected.value =
            level.value === "deploy"
              ? `Deploy ${command.title}`
              : command.title;
        }
      }
      return { back, currentCommands, level, query, run, selected };
    },
    template: `
      <div class="grid w-[min(30rem,calc(100vw-2rem))] gap-3">
        <Command v-model:query="query" :commands="currentCommands" :placeholder="level === 'root' ? 'Search commands' : 'Choose an application'" label="Nested commands" @select="run" @escape="back" @back="back">
          <template #before>
            <button v-if="level !== 'root'" type="button" class="min-h-11 cursor-pointer px-2 text-sm font-medium" @click="back">← Commands</button>
          </template>
          <template #item="{ command }">
            <span class="font-medium">{{ command.title }}</span>
            <span v-if="command.children" aria-hidden="true" class="ml-auto text-gray-400">→</span>
          </template>
        </Command>
        <p class="text-sm text-gray-500" aria-live="polite">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};
