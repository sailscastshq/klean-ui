import { expect, userEvent, within } from "storybook/test";
import { ref } from "vue";
import Button from "../src/vue/button/Button.vue";
import Dialog from "../src/vue/dialog/Dialog.vue";
import { contract } from "./shared/contract.js";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A native modal dialog. Real buttons use command and commandfor; the browser owns the top layer, inert background, focus containment, Escape, and focus return. Tailwind owns the product design.",
      },
    },
  },
  args: {
    dismissible: true,
    class: "",
  },
  argTypes: {
    dismissible: {
      control: "boolean",
      description:
        "Allows ambient Escape, platform dismissal, and backdrop dismissal.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes merged after neutral defaults.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["dismissible", "class"] } },
  render: (args) => ({
    components: { Button, Dialog },
    setup() {
      const open = ref(false);
      return { args, contract, open };
    },
    template: `
      <div class="grid justify-items-start gap-3">
        <p class="text-sm text-gray-600" aria-live="polite">Dialog is {{ open ? 'open' : 'closed' }}</p>
        <Button :commandfor="contract.dialogId" command="show-modal">
          {{ contract.dialogLabel }}
        </Button>

        <Dialog
          :id="contract.dialogId"
          v-model:open="open"
          :dismissible="args.dismissible"
          :class="args.class"
          aria-labelledby="playground-dialog-title"
          aria-describedby="playground-dialog-description"
        >
          <h2 id="playground-dialog-title" class="text-xl font-semibold tracking-tight">
            {{ contract.dialogTitle }}
          </h2>
          <p id="playground-dialog-description" class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            The project and its deployment history will be permanently removed.
          </p>
          <form method="dialog" class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="submit" value="cancel" autofocus class="bg-white text-gray-950 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button type="submit" value="delete" class="bg-red-700 hover:bg-red-800 active:bg-red-900 dark:bg-red-600 dark:text-white dark:hover:bg-red-500 dark:active:bg-red-700">
              Delete project
            </Button>
          </form>
        </Dialog>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: contract.dialogLabel });
    const dialog = canvasElement.querySelector(`#${contract.dialogId}`);

    await userEvent.click(trigger);
    await expect(dialog).toHaveAttribute("open");
    await expect(dialog).toHaveAttribute("data-state", "open");
    await expect(canvas.getByRole("button", { name: "Cancel" })).toHaveFocus();
    dialog.requestClose();
    await expect(dialog).not.toHaveAttribute("open");
    await expect(trigger).toHaveFocus();
  },
};

export const ExplicitCompletion = {
  name: "Explicit completion",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Dialog },
    template: `
      <div>
        <Button commandfor="provisioning-dialog" command="show-modal">View deployment</Button>
        <Dialog id="provisioning-dialog" :dismissible="false" aria-labelledby="provisioning-title" class="max-w-md">
          <p class="font-mono text-xs uppercase tracking-[0.18em] text-gray-500">Deployment in progress</p>
          <h2 id="provisioning-title" class="mt-2 text-xl font-semibold">Provisioning production</h2>
          <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">Ambient dismissal is paused while this operation owns the workflow. A real completion button remains keyboard operable.</p>
          <form method="dialog" class="mt-6 flex justify-end">
            <Button type="submit" value="done" autofocus>Done</Button>
          </form>
        </Dialog>
      </div>
    `,
  }),
};

export const ScrollableContent = {
  name: "Long content",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Dialog },
    template: `
      <div>
        <Button commandfor="terms-dialog" command="show-modal">Review terms</Button>
        <Dialog id="terms-dialog" aria-labelledby="terms-title" class="max-w-2xl p-0">
          <header class="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
            <h2 id="terms-title" class="text-xl font-semibold">Service terms</h2>
          </header>
          <div class="max-h-[min(60dvh,36rem)] space-y-5 overflow-y-auto px-6 py-5 text-sm leading-7 text-gray-700 dark:text-gray-300" autofocus tabindex="-1">
            <p v-for="index in 10" :key="index">Section {{ index }} keeps its semantic reading order inside a deliberately scrollable body. The native dialog itself remains a stable top-layer frame.</p>
          </div>
          <form method="dialog" class="flex justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            <Button type="submit" value="close">Close</Button>
          </form>
        </Dialog>
      </div>
    `,
  }),
};

export const ProductRecipes = {
  name: "Products",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button, Dialog },
    template: `
      <div class="grid min-h-152 bg-gray-100 p-6 sm:grid-cols-2 sm:p-12">
        <section class="flex items-start justify-center bg-[#f7f3eb] p-8 sm:p-14" aria-labelledby="hagfish-dialog-recipe">
          <div>
            <h2 id="hagfish-dialog-recipe" class="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-black/60">Hagfish / invoice editor</h2>
            <Button commandfor="hagfish-delete-dialog" command="show-modal" class="rounded-lg border-2 border-black bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
              Delete draft
            </Button>
            <Dialog id="hagfish-delete-dialog" aria-labelledby="hagfish-delete-title" aria-describedby="hagfish-delete-description" class="max-w-md rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-6">
              <p class="text-xs font-medium uppercase tracking-wider text-red-700">Permanent action</p>
              <h3 id="hagfish-delete-title" class="mt-1 text-xl font-semibold tracking-tight">Delete this draft invoice?</h3>
              <div id="hagfish-delete-description" class="mt-5 space-y-3 text-sm leading-6 text-black/60">
                <p><strong class="text-black">INV-1042</strong> and its items, comments, and public link will be permanently removed.</p>
                <p class="font-medium text-red-700">This cannot be undone.</p>
              </div>
              <form method="dialog" class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="submit" value="cancel" autofocus class="border-2 border-black bg-white text-black hover:bg-black hover:text-white">Cancel</Button>
                <Button type="submit" value="delete" class="border-2 border-red-700 bg-red-700 text-white hover:bg-white hover:text-red-700">Delete invoice</Button>
              </form>
            </Dialog>
          </div>
        </section>

        <section class="dark flex items-start justify-center bg-gray-950 p-8 text-white sm:p-14" aria-labelledby="slipway-dialog-recipe">
          <div>
            <h2 id="slipway-dialog-recipe" class="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-gray-400">Slipway / project settings</h2>
            <Button commandfor="slipway-delete-dialog" command="show-modal" class="min-h-9 min-w-0 bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700">Delete project</Button>
            <Dialog id="slipway-delete-dialog" aria-labelledby="slipway-delete-title" aria-describedby="slipway-delete-description" class="max-w-sm rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-xl">
              <h3 id="slipway-delete-title" class="text-lg font-semibold">Delete project?</h3>
              <p id="slipway-delete-description" class="mt-2 text-sm text-gray-400">This action cannot be undone.</p>
              <form method="dialog" class="mt-4 flex justify-end gap-3">
                <Button type="submit" value="cancel" autofocus class="min-h-9 min-w-0 border border-gray-600 bg-transparent px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800">Cancel</Button>
                <Button type="submit" value="delete" class="min-h-9 min-w-0 bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700">Delete</Button>
              </form>
            </Dialog>
          </div>
        </section>
      </div>
    `,
  }),
};
