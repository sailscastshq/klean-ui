const meta = {
  title: "Klean UI/Durable UI",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
  },
};

export default meta;

export const Contract = {
  name: "Product contract",
  render: () => ({
    template: `
      <main class="klean-story-canvas min-h-svh overflow-hidden">
        <section class="px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-24" aria-labelledby="durable-story-title">
          <div class="max-w-5xl">
            <h1 id="durable-story-title" class="max-w-5xl text-balance text-[clamp(3rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
              UI that keeps<br />its promises.
            </h1>
            <p class="mt-8 max-w-2xl text-pretty text-base leading-7 text-klean-muted sm:text-lg">
              Klean UI implements our Durable UI practice as readable Vue, React, and Svelte source for The Boring JavaScript Stack. State survives where it should. Interactions recover when work is dismissed, interrupted, or fails.
            </p>
          </div>

          <dl class="mt-14 grid gap-px bg-klean-line sm:grid-cols-2 lg:grid-cols-4">
            <div class="bg-white p-6 sm:p-8">
              <dt class="text-sm font-medium text-klean-muted">Preference</dt>
              <dd class="mt-4 text-xl font-semibold">Remember it.</dd>
              <dd class="mt-3 text-sm leading-6 text-klean-muted">Versioned browser storage with SSR safety and cross-tab synchronization.</dd>
            </div>
            <div class="bg-white p-6 sm:p-8">
              <dt class="text-sm font-medium text-klean-muted">Navigation context</dt>
              <dd class="mt-4 text-xl font-semibold">Put it in the URL.</dd>
              <dd class="mt-3 text-sm leading-6 text-klean-muted">Shareable filters, tabs, pages, and deep links with honest browser history.</dd>
            </div>
            <div class="bg-white p-6 sm:p-8">
              <dt class="text-sm font-medium text-klean-muted">User effort</dt>
              <dd class="mt-4 text-xl font-semibold">Never lose it.</dd>
              <dd class="mt-3 text-sm leading-6 text-klean-muted">Expiring form and wizard drafts that restore deliberately and clear after success.</dd>
            </div>
            <div class="bg-klean-ink p-6 text-white sm:p-8">
              <dt class="text-sm font-medium text-white/55">Layered interaction</dt>
              <dd class="mt-4 text-xl font-semibold">Dismiss and recover.</dd>
              <dd class="mt-3 text-sm leading-6 text-white/55">Escape, outside and backdrop dismissal, focus containment, focus return, and cleanup.</dd>
            </div>
          </dl>
        </section>

        <section class="grid gap-10 bg-white px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:px-12 lg:py-24" aria-labelledby="durable-surface-title">
          <div>
            <h2 id="durable-surface-title" class="text-3xl font-semibold tracking-[-0.04em]">Opinionated outcomes. Small APIs.</h2>
          </div>
          <ul class="grid gap-x-10 gap-y-6 text-sm leading-6 text-klean-muted sm:grid-cols-2" role="list">
            <li><strong class="block text-klean-ink">State resilience</strong>Storage, URL state, drafts, wizards, and scroll restoration.</li>
            <li><strong class="block text-klean-ink">Interaction resilience</strong>Dismissal, focus management, and recovery after deletion.</li>
            <li><strong class="block text-klean-ink">Async resilience</strong>Optimistic rollback, toast queues, and stale-request cancellation.</li>
            <li><strong class="block text-klean-ink">Boring Stack fit</strong>Inertia-aware recipes and Sails integration without forcing them into every primitive.</li>
          </ul>
        </section>
      </main>
    `,
  }),
};
