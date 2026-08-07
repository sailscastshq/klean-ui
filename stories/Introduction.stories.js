import Button from "../src/vue/button/Button.vue";
import Dialog from "../src/vue/dialog/Dialog.vue";

const meta = {
  title: "Klean UI/Introduction",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
  },
};

export default meta;

export const Philosophy = {
  name: "Design philosophy",
  render: () => ({
    components: { Button, Dialog },
    template: `
      <main class="klean-story-canvas min-h-svh overflow-hidden">
        <header class="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <p class="font-mono text-xs font-semibold uppercase tracking-[0.22em]">Klean UI</p>
          <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-klean-muted">Boring Stack · Source owned</p>
        </header>

        <section class="grid items-end gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:px-12 lg:pb-24 lg:pt-24">
          <div class="max-w-4xl">
            <p class="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-klean-muted">Kelvin's Lean UI</p>
            <h1 class="max-w-4xl text-balance text-[clamp(3.2rem,7vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
              UI you<br />own.
            </h1>
            <p class="mt-8 max-w-xl text-pretty text-base leading-7 text-klean-muted sm:text-lg">
              Klean means Kelvin's Lean UI: accessible, durable, source-owned components and patterns for The Boring JavaScript Stack. Native HTML underneath. Tailwind in your hands.
            </p>
          </div>

          <aside class="bg-klean-ink p-6 text-white sm:p-8 lg:mb-2" aria-labelledby="semantic-contract-title">
            <h2 id="semantic-contract-title" class="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">Semantics before style</h2>
            <dl class="mt-10 grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 text-sm">
              <dt class="text-white/45">Action</dt>
              <dd class="font-mono">&lt;button&gt;</dd>
              <dt class="text-white/45">Navigation</dt>
              <dd class="font-mono">&lt;a&gt; or &lt;Link&gt;</dd>
              <dt class="text-white/45">Visual API</dt>
              <dd class="font-mono">class="..."</dd>
            </dl>
            <div class="mt-10 flex flex-wrap items-center gap-3">
              <Button commandfor="introduction-dialog" command="show-modal">Open dialog</Button>
              <Button as="a" href="#doctrine-heading" class="bg-transparent text-white ring-1 ring-inset ring-white/25 hover:bg-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/10">
                Read the doctrine
              </Button>
            </div>
          </aside>

          <Dialog id="introduction-dialog" aria-labelledby="introduction-dialog-title" class="max-w-md">
            <p class="font-mono text-xs uppercase tracking-[0.18em] text-gray-500">Native underneath</p>
            <h2 id="introduction-dialog-title" class="mt-2 text-2xl font-semibold tracking-tight">The platform does the hard part.</h2>
            <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">This is a real dialog opened by a real button. The browser owns the top layer, modality, focus containment, Escape, and focus return.</p>
            <form method="dialog" class="mt-6 flex justify-end">
              <Button type="submit" value="close" autofocus>Close</Button>
            </form>
          </Dialog>
        </section>

        <section class="grid gap-10 bg-white px-5 py-16 sm:px-8 lg:grid-cols-3 lg:px-12 lg:py-24" aria-labelledby="doctrine-heading">
          <div>
            <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">01 / Doctrine</p>
            <h2 id="doctrine-heading" class="mt-4 text-3xl font-semibold tracking-[-0.04em]">Small API. Full ownership.</h2>
          </div>
          <dl class="space-y-8 lg:col-span-2 lg:grid lg:grid-cols-3 lg:gap-x-10 lg:space-y-0">
            <div>
              <dt class="font-semibold">Classes are the visual API</dt>
              <dd class="mt-2 max-w-md text-sm leading-6 text-klean-muted">No variant matrix between you and Tailwind. Build app-owned components from lean source and let their classes take control.</dd>
            </div>
            <div>
              <dt class="font-semibold">The element tells the truth</dt>
              <dd class="mt-2 max-w-md text-sm leading-6 text-klean-muted">Actions render buttons. Navigation renders anchors or the Boring Stack Link. Appearance never changes semantics.</dd>
            </div>
            <div>
              <dt class="font-semibold">Accessibility decides dependencies</dt>
              <dd class="mt-2 max-w-md text-sm leading-6 text-klean-muted">Use native HTML first. Reach for a focused interaction primitive only when keyboard, focus, or ARIA behavior is genuinely complex.</dd>
            </div>
          </dl>
        </section>

        <section class="grid gap-12 bg-klean-ink px-5 py-16 text-white sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-12 lg:py-24" aria-labelledby="durable-heading">
          <div class="max-w-xl">
            <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">02 / Durable UI</p>
            <h2 id="durable-heading" class="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">State survives. Interactions recover.</h2>
            <p class="mt-6 text-pretty text-base leading-7 text-white/60">
              Klean UI implements our Durable UI patterns across Vue, React, and Svelte. Preferences persist, useful views stay shareable, drafts recover, overlays dismiss correctly, focus returns, and failed optimistic work rolls back.
            </p>
          </div>

          <dl class="grid gap-px bg-white/15 sm:grid-cols-2">
            <div class="bg-klean-ink p-6 sm:p-8">
              <dt class="font-semibold">State resilience</dt>
              <dd class="mt-3 text-sm leading-6 text-white/55">Storage, URL state, form drafts, multi-step progress, and scroll restoration with sensible Boring Stack defaults.</dd>
            </div>
            <div class="bg-klean-ink p-6 sm:p-8">
              <dt class="font-semibold">Interaction resilience</dt>
              <dd class="mt-3 text-sm leading-6 text-white/55">Dismissal, focus management, optimistic rollback, toast queues, and cancellable debounced search.</dd>
            </div>
            <div class="bg-klean-ink p-6 sm:p-8">
              <dt class="font-semibold">UI honesty</dt>
              <dd class="mt-3 text-sm leading-6 text-white/55">Derive dirty, busy, selected, saved, and error states from reality. Never make the interface promise what the application has not done.</dd>
            </div>
            <div class="bg-klean-ink p-6 sm:p-8">
              <dt class="font-semibold">Convention over configuration</dt>
              <dd class="mt-3 text-sm leading-6 text-white/55">Framework-native components and state utilities arrive as readable source with safe defaults—no provider maze, manifest, or state-library setup.</dd>
            </div>
          </dl>
        </section>
      </main>
    `,
  }),
};
