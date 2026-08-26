<script>
  import Button from "../../registry/button/svelte/Button.svelte";
  import ProductButton from "./ThemingProductButton.svelte";
</script>

<main class="klean-story-canvas min-h-svh overflow-hidden">
  <section
    class="px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
    aria-labelledby="theming-title"
  >
    <header class="max-w-4xl">
      <h1
        id="theming-title"
        class="text-balance text-[clamp(3rem,7vw,7rem)] leading-[0.9] font-semibold tracking-[-0.065em]"
      >
        The application<br />is the theme.
      </h1>
      <p
        class="mt-7 max-w-2xl text-pretty text-base leading-7 text-klean-muted sm:text-lg"
      >
        Klean arrives neutral. A local choice is a class. A repeated product
        concept becomes an application component. Only shared values become CSS.
      </p>
    </header>

    <dl class="mt-14 grid gap-px bg-klean-line lg:grid-cols-3">
      <div class="bg-white p-6 sm:p-8">
        <dt class="font-semibold">Zero configuration</dt>
        <dd class="mt-2 min-h-12 text-sm leading-6 text-klean-muted">
          The copied Button works before the application defines a token.
        </dd>
        <dd class="mt-8"><Button>Continue</Button></dd>
      </div>
      <div class="bg-white p-6 sm:p-8">
        <dt class="font-semibold">Local Tailwind</dt>
        <dd class="mt-2 min-h-12 text-sm leading-6 text-klean-muted">
          Caller classes replace the neutral radius, spacing, color, and type.
        </dd>
        <dd class="mt-8">
          <Button
            class="min-h-12 rounded-none bg-emerald-700 px-6 font-serif text-base text-white hover:bg-emerald-800 focus-visible:outline-emerald-700 dark:bg-emerald-700 dark:text-white dark:hover:bg-emerald-800"
          >
            Approve invoice
          </Button>
        </dd>
      </div>
      <div class="bg-white p-6 sm:p-8">
        <dt class="font-semibold">Product component</dt>
        <dd class="mt-2 min-h-12 text-sm leading-6 text-klean-muted">
          A recurring treatment earns a product name, not a visual prop.
        </dd>
        <dd class="mt-8">
          <ProductButton>Start deployment</ProductButton>
        </dd>
      </div>
    </dl>
  </section>

  <section
    class="bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
    aria-labelledby="mode-proof-title"
  >
    <div
      class="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-end"
    >
      <div>
        <h2
          id="mode-proof-title"
          class="text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl"
        >
          Modes are CSS state.
        </h2>
        <p
          class="mt-5 max-w-xl text-pretty text-base leading-7 text-klean-muted"
        >
          A small optional role set coordinates unrelated surfaces. The root
          owns the resolved mode; components receive no theme prop.
        </p>
      </div>
      <p
        class="max-w-2xl text-sm leading-6 text-klean-muted lg:justify-self-end"
      >
        Hagfish and Slipway remain proving applications with distinct Tailwind
        recipes—not selectable Klean themes.
      </p>
    </div>

    <div
      class="mt-12 grid overflow-hidden border border-klean-line lg:grid-cols-2"
    >
      <section
        data-mode="light"
        aria-label="Light mode proof"
        class="bg-app-canvas p-6 text-app-ink sm:p-10"
      >
        <div class="border border-app-line bg-app-surface p-6 sm:p-8">
          <h3 class="text-2xl font-semibold tracking-tight">Light</h3>
          <p class="mt-3 max-w-md text-sm leading-6 text-app-muted">
            Canvas, ink, surface, muted, line, focus, brand, and on-brand are
            enough for this coordinated surface.
          </p>
          <Button
            class="mt-8 bg-app-brand text-app-on-brand hover:bg-app-brand/90 focus-visible:outline-app-focus forced-colors:border forced-colors:border-[ButtonText]"
          >
            Save preference
          </Button>
        </div>
      </section>

      <section
        data-mode="dark"
        aria-label="Dark mode proof"
        class="bg-app-canvas p-6 text-app-ink sm:p-10"
      >
        <div class="border border-app-line bg-app-surface p-6 sm:p-8">
          <h3 class="text-2xl font-semibold tracking-tight">Dark</h3>
          <p class="mt-3 max-w-md text-sm leading-6 text-app-muted">
            The same semantic utilities inherit deliberate values and native
            controls receive the matching color scheme.
          </p>
          <Button
            class="mt-8 bg-app-brand text-app-on-brand hover:bg-app-brand/90 focus-visible:outline-app-focus forced-colors:border forced-colors:border-[ButtonText]"
          >
            Save preference
          </Button>
        </div>
      </section>
    </div>
  </section>
</main>
