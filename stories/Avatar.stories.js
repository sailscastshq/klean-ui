import { computed } from "vue";
import { expect, userEvent, within } from "storybook/test";
import Avatar from "../src/vue/avatar/Avatar.vue";
import Button from "../src/vue/button/Button.vue";
import Spinner from "../src/vue/spinner/Spinner.vue";
import { avatarImages } from "./shared/avatar-images.js";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One native identity image with one accessible fallback. Ordinary Tailwind owns its appearance; a surrounding button or link owns interaction.",
      },
    },
  },
  args: {
    image: true,
    alt: "Ada Okafor",
    fallback: "AO",
    class: "",
  },
  argTypes: {
    image: { control: "boolean" },
    alt: { control: "text" },
    fallback: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["image", "alt", "fallback", "class"] },
  },
  render: (args) => ({
    components: { Avatar },
    setup() {
      const src = computed(() => (args.image ? avatarImages.ada : ""));
      return { args, src };
    },
    template: `
      <Avatar :src="src" :alt="args.alt" :class="args.class">
        {{ args.fallback }}
      </Avatar>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img", { name: args.alt });

    await expect(avatar).toHaveAttribute("data-slot", "avatar");
    await expect(avatar).toHaveAttribute(
      "data-state",
      args.image ? "image" : "fallback",
    );
  },
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Avatar },
    setup() {
      return { avatarImages };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="avatar-states-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">One resilient identity mark</p>
          <h1 id="avatar-states-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">The face arrives. Identity remains.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">An image can be present, absent, late, or broken. The occupied space and accessible identity stay honest while application classes change every visual detail.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <Avatar :src="avatarImages.ada" alt="Ada Okafor" class="size-16" loading="eager">AO</Avatar>
            <h2 class="mt-5 font-medium">Native image</h2>
            <p class="mt-1 text-sm leading-6 text-klean-muted">The real image and native alt semantics.</p>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <Avatar src="" alt="Maya Chen" class="size-16 bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200">MC</Avatar>
            <h2 class="mt-5 font-medium">Absent source</h2>
            <p class="mt-1 text-sm leading-6 text-klean-muted">The fallback is named as one image.</p>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <Avatar src="/missing-avatar.webp" alt="Kelvin Omereshone" class="size-16 rounded-lg bg-black font-mono text-white dark:bg-white dark:text-black">KO</Avatar>
            <h2 class="mt-5 font-medium">Broken source</h2>
            <p class="mt-1 text-sm leading-6 text-klean-muted">A failed image yields the same fallback.</p>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <div class="flex items-center gap-3">
              <Avatar src="" alt="" class="size-16 rounded-2xl bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200">SL</Avatar>
              <span class="font-medium">Slipway Labs</span>
            </div>
            <h2 class="mt-5 font-medium">Decorative in context</h2>
            <p class="mt-1 text-sm leading-6 text-klean-muted">The adjacent name prevents repetition.</p>
          </article>
        </div>

        <div class="mt-8 flex max-w-6xl items-end gap-5 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <Avatar :src="avatarImages.kelvin" alt="Kelvin Omereshone" class="size-5">KO</Avatar>
          <Avatar :src="avatarImages.kelvin" alt="Kelvin Omereshone" class="size-8">KO</Avatar>
          <Avatar :src="avatarImages.kelvin" alt="Kelvin Omereshone" class="size-12 rounded-lg">KO</Avatar>
          <Avatar :src="avatarImages.kelvin" alt="Kelvin Omereshone" class="size-20 rounded-2xl bg-gray-100 object-contain">KO</Avatar>
          <p class="ml-auto max-w-xs text-right text-sm leading-6 text-klean-muted">Size and shape are classes, not decisions hidden in a component API.</p>
        </div>
      </section>
    `,
  }),
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Avatar, Button, Spinner },
    setup() {
      const teams = [
        { name: "Slipway", initials: "SW", src: avatarImages.kelvin },
        { name: "Sailscasts", initials: "SC", src: "" },
        { name: "Boring Stack", initials: "BS", src: avatarImages.maya },
      ];
      const comments = [
        { name: "Kelvin Omereshone", initials: "KO", src: avatarImages.kelvin, message: "The schedule is ready to send." },
        { name: "Ada Okafor", initials: "AO", src: "", message: "Perfect. I checked the invoice dates." },
      ];
      return { avatarImages, teams, comments };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="avatar-apps-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Application recipes</p>
          <h1 id="avatar-apps-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Same primitive. Unmistakably each app.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Hagfish keeps expressive creator identity and dense comments. Slipway keeps quiet team navigation and an honest upload preview. Avatar only carries identity between them.</p>
        </header>

        <div class="mt-12 grid max-w-7xl gap-10 xl:grid-cols-2">
          <article class="space-y-4">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Hagfish / invoice discussion</p>
            <div class="border-2 border-black bg-[#f7f3eb] p-5 shadow-[6px_6px_0_0_#000] dark:border-white dark:bg-gray-950 dark:shadow-[6px_6px_0_0_#fff]">
              <a href="#creator" class="flex w-full items-center gap-3 border-b-2 border-black pb-4 no-underline dark:border-white">
                <span class="relative inline-flex">
                  <Avatar :src="avatarImages.kelvin" alt="" class="size-11 rounded-lg bg-black font-mono text-white dark:bg-white dark:text-black">KO</Avatar>
                  <span class="absolute -right-1 -bottom-1 grid size-3 rounded-sm border-2 border-[#f7f3eb] bg-emerald-500 dark:border-gray-950"><span class="sr-only">Online</span></span>
                </span>
                <span><strong class="block text-sm">Kelvin Omereshone</strong><span class="text-xs text-gray-600 dark:text-gray-300">Invoice creator</span></span>
                <span aria-hidden="true" class="ml-auto">↗</span>
              </a>
              <ol class="mt-5 space-y-5">
                <li v-for="comment in comments" :key="comment.name" class="flex items-start gap-3">
                  <Avatar :src="comment.src" alt="" :class="['size-7 text-[10px] font-bold text-white', comment.src ? '' : 'bg-gray-900']">{{ comment.initials }}</Avatar>
                  <div class="min-w-0"><p class="text-xs font-semibold">{{ comment.name }}</p><p class="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300">{{ comment.message }}</p></div>
                </li>
              </ol>
            </div>
          </article>

          <article class="space-y-4">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Slipway / team identity</p>
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <Button type="button" class="flex min-h-0 w-full justify-start gap-3 rounded-none border-0 bg-gray-50 px-4 py-3 text-gray-950 shadow-none hover:bg-gray-100 active:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 dark:active:bg-gray-800">
                <Avatar :src="avatarImages.kelvin" alt="" class="size-7 rounded-md">SW</Avatar>
                <span class="text-sm font-medium">Slipway</span>
                <svg aria-hidden="true" class="ml-auto size-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="m6 8 4 4 4-4" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </Button>
              <ul class="border-t border-gray-200 p-1.5 dark:border-gray-800">
                <li v-for="team in teams" :key="team.name">
                  <button type="button" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-900">
                    <Avatar :src="team.src" alt="" class="size-6 rounded-md bg-gray-900 text-[10px] text-white dark:bg-gray-100 dark:text-gray-950">{{ team.initials }}</Avatar>
                    <span class="flex-1">{{ team.name }}</span>
                    <span v-if="team.name === 'Slipway'" aria-label="Current team" class="text-emerald-600">✓</span>
                  </button>
                </li>
              </ul>
              <div class="border-t border-gray-200 p-4 dark:border-gray-800">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Profile preview</p>
                <div class="mt-3 flex items-center gap-4">
                  <span class="relative inline-flex">
                    <Avatar :src="avatarImages.maya" alt="Boring Stack team logo" class="size-16 rounded-xl">BS</Avatar>
                    <span role="status" class="absolute inset-0 grid place-items-center rounded-xl bg-black/55"><Spinner class="size-5 text-white" /><span class="sr-only">Uploading team logo</span></span>
                  </span>
                  <div><p class="text-sm font-medium">Boring Stack</p><p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Uploading a new logo…</p></div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const teamButton = canvas.getByRole("button", { name: "Slipway" });
    const creatorLink = canvas.getByRole("link", { name: /Kelvin Omereshone/ });

    await expect(teamButton).toHaveAttribute("type", "button");
    await expect(creatorLink).toHaveAttribute("href", "#creator");
    await userEvent.click(teamButton);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Uploading team logo",
    );
  },
};
