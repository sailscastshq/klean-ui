import { onMounted, ref } from "vue";
import RichText from "../src/vue/rich-text/RichText.vue";
import { useFormDraft } from "../registry/durable-ui/vue/useFormDraft.js";

const introduction =
  "<h2>Build something worth sharing.</h2><p>A practical session on turning an idea into a <strong>real application</strong> with The Boring JavaScript Stack.</p><p>We will build together, talk through the trade-offs, and leave with something you can use.</p><ul><li>Start with the browser and keep the good parts.</li><li>Make every interaction accessible and resilient.</li><li>Ship a small, complete feature.</li></ul>";
export default {
  title: "Components/Rich Text",
  component: RichText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Write formatted content with a compact toolbar, HTML or Markdown, and an editable source. Images use your own upload callback. Choose Textarea when plain text is enough.",
      },
    },
  },
  args: {
    disabled: false,
    readonly: false,
    required: false,
    placeholder: "Write something worth sharing…",
  },
};
export const Playground = {
  render: (args) => ({
    components: { RichText },
    setup: () => ({ args, value: ref(introduction) }),
    template: `<div class="grid w-[min(48rem,calc(100vw-3rem))] gap-3"><label for="rich-playground" class="text-sm font-medium">Description</label><RichText id="rich-playground" v-model="value" v-bind="args" name="description" /><details class="mt-2 text-sm text-gray-500"><summary class="cursor-pointer">View HTML</summary><pre class="mt-3 max-w-full overflow-auto whitespace-pre-wrap rounded-lg bg-gray-100 p-4 text-xs dark:bg-gray-900">{{ value }}</pre></details></div>`,
  }),
};
export const ConferenceProposal = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { RichText },
    setup() {
      const form = ref({
        abstract:
          "## Build something worth sharing.\n\nA practical session on turning an idea into a **real application** with The Boring JavaScript Stack.\n\nWe will build together, talk through the trade-offs, and leave with something you can use.\n\n- Start with the browser and keep the good parts.\n- Make every interaction accessible and resilient.\n- Ship a small, complete feature.",
      });
      const draft = useFormDraft("klean-rich-text-conference", form, {
        guard: false,
      });
      const offerRestore = ref(false);
      onMounted(() => {
        offerRestore.value = draft.hasDraft.value;
      });
      return { form, draft, offerRestore, result: ref("") };
    },
    template: `<main class="min-h-screen bg-[#f8f9fb] px-4 py-10 text-gray-950 sm:px-8 sm:py-16"><form class="mx-auto max-w-3xl" @submit.prevent="result = 'Your proposal is ready to review. This demo has not sent it.'"><div class="mb-8 flex items-center justify-between gap-4"><a href="#conference" class="text-lg font-semibold tracking-tight">Sailsconf</a><span class="rounded-full bg-white px-3 py-1.5 text-xs text-gray-600 ring-1 ring-gray-200">Call for proposals</span></div><h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Your next great talk.</h1><p class="mt-3 max-w-xl text-base/7 text-gray-600">Share the idea you keep coming back to. Tell us what people will learn—and why it matters.</p><div v-if="offerRestore && draft.hasDraft.value && !draft.restored.value" class="mt-6 flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><span>A browser draft is available.</span><button type="button" class="cursor-pointer font-medium underline" @click="draft.restore(); offerRestore = false">Restore draft</button><button type="button" class="cursor-pointer underline" @click="draft.discard(); offerRestore = false">Discard</button></div><div class="mt-9 grid gap-3"><label for="conference-abstract" class="text-sm font-semibold">Talk abstract</label><RichText id="conference-abstract" v-model="form.abstract" format="markdown" name="abstract" required :maxlength="5000" aria-describedby="conference-hint" class="rounded-2xl border-gray-200 bg-white shadow-[0_4px_30px_-12px_#10182820] **:data-[slot=rich-text-content]:min-h-80 **:data-[slot=rich-text-content]:px-6 **:data-[slot=rich-text-content]:py-5 **:data-[slot=rich-text-toolbar]:rounded-t-2xl" /><div id="conference-hint" class="flex flex-wrap items-center justify-between gap-2 text-xs/6 text-gray-500"><span>Clear takeaways. A little personality. Your own words.</span><span>{{ draft.savedAt.value ? 'Draft saved in this browser' : 'Drafts save here as you write' }}</span></div></div><div class="mt-7 flex flex-wrap items-center gap-3"><button type="submit" class="min-h-11 cursor-pointer rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950">Review proposal <span aria-hidden="true" class="ms-2">→</span></button><button type="button" class="min-h-11 cursor-pointer rounded-lg px-3 text-sm text-gray-600 hover:bg-gray-100" @click="draft.clear(); result = 'Browser draft cleared.'">Clear saved draft</button></div><p role="status" class="mt-4 text-sm text-gray-600">{{ result }}</p></form></main>`,
  }),
};
export const Markdown = {
  render: () => ({
    components: { RichText },
    setup: () => ({
      value: ref(
        "## A quieter release\n\nWe've improved **deployment feedback** and made the little things feel better.\n\n- Clearer progress\n- Better keyboard navigation\n- Fewer surprises\n\n[Read the release notes](https://example.com/releases)",
      ),
    }),
    template: `<div class="grid w-[min(44rem,calc(100vw-3rem))] gap-3"><label for="rich-markdown" class="text-sm font-medium">Customer update</label><RichText id="rich-markdown" v-model="value" format="markdown" name="body" /></div>`,
  }),
};
export const SourcePreservation = {
  render: () => ({
    components: { RichText },
    setup: () => ({
      value: ref(
        "## Shipping checklist\n\n- [x] Tested in production\n- [ ] Published the release\n\n<!-- Keep this editorial note. -->",
      ),
    }),
    template: `<div class="grid w-[min(44rem,calc(100vw-3rem))] gap-3"><label for="rich-source" class="text-sm font-medium">Existing document</label><RichText id="rich-source" v-model="value" format="markdown" /><p class="text-sm/6 text-gray-500">Content that needs more than the default formatting stays editable in source mode.</p></div>`,
  }),
};
export const Form = {
  render: () => ({
    components: { RichText },
    setup: () => ({ value: ref(""), result: ref("") }),
    template: `<form class="grid w-[min(44rem,calc(100vw-3rem))] gap-3" @submit.prevent="result = JSON.stringify(Object.fromEntries(new FormData($event.target)))"><label for="rich-required" class="text-sm font-medium">Session description</label><RichText id="rich-required" v-model="value" name="description" required /><div class="flex gap-3"><button type="submit" class="min-h-11 cursor-pointer rounded-md bg-gray-950 px-4 text-sm text-white">Save description</button><button type="reset" class="min-h-11 cursor-pointer rounded-md border border-gray-300 px-4 text-sm">Reset</button></div><output class="whitespace-pre-wrap wrap-anywhere text-xs text-gray-500">{{ result }}</output></form>`,
  }),
};
export const States = {
  render: () => ({
    components: { RichText },
    setup: () => ({
      value: ref(
        "<p>Your <strong>published</strong> description stays readable.</p>",
      ),
    }),
    template: `<div class="grid w-[min(44rem,calc(100vw-3rem))] gap-7"><div class="grid gap-2"><label for="rich-readonly" class="text-sm font-medium">Read only</label><RichText id="rich-readonly" :model-value="value" readonly /></div><div class="grid gap-2"><label for="rich-disabled" class="text-sm font-medium">Unavailable</label><RichText id="rich-disabled" :model-value="value" disabled /></div></div>`,
  }),
};
export const CustomToolbar = {
  render: () => ({
    components: { RichText },
    setup: () => ({
      value: ref(
        "<p>A little <strong>emphasis</strong>, without the entire toolbar.</p>",
      ),
    }),
    template: `<div class="grid w-[min(40rem,calc(100vw-3rem))] gap-3"><label for="rich-custom" class="text-sm font-medium">Short note</label><RichText id="rich-custom" v-model="value" class="rounded-none border-0 border-b border-dashed border-gray-300 shadow-none **:data-[slot=rich-text-content]:min-h-32 **:data-[slot=rich-text-content]:px-1"><template #toolbar="{ editor, mode, setMode }"><div class="flex gap-2"><button type="button" class="min-h-10 cursor-pointer rounded-md px-3 text-sm font-bold hover:bg-gray-100" :disabled="!editor || mode === 'source'" :aria-pressed="editor?.isActive('bold') ?? false" @mousedown.prevent @click="editor?.chain().focus().toggleBold().run()">Bold</button><button type="button" class="min-h-10 cursor-pointer rounded-md px-3 text-sm hover:bg-gray-100" @click="setMode(mode === 'source' ? 'visual' : 'source')">{{ mode === 'source' ? 'Write' : 'Source' }}</button></div></template></RichText></div>`,
  }),
};
