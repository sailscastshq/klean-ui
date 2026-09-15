import { expect, within } from "storybook/test";
import AvatarGroup from "../src/vue/avatar-group/AvatarGroup.vue";
import { avatarGroupPeople } from "./shared/avatar-group-people.js";

const meta = {
  title: "Components/AvatarGroup",
  component: AvatarGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A stack of Avatars with a truthful overflow count. Pass `total` when the items are only part of a larger set.",
      },
    },
  },
  args: {
    max: 4,
    total: 42,
    avatarClass: "",
    class: "",
  },
  argTypes: {
    max: { control: { type: "number", min: 0, max: 6 } },
    total: { control: { type: "number", min: 0 } },
    avatarClass: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  render: (args) => ({
    components: { AvatarGroup },
    setup() {
      return { args, people: avatarGroupPeople };
    },
    template: `
      <AvatarGroup
        :items="people"
        :max="args.max"
        :total="args.total"
        :avatar-class="args.avatarClass"
        :class="args.class"
        aria-label="Maintainers"
      />
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Maintainers" });
    await expect(group).toHaveAttribute("data-slot", "avatar-group");
    const shown = Math.min(args.max, avatarGroupPeople.length);
    const hidden = Math.max(args.total, shown) - shown;
    if (hidden > 0) {
      await expect(canvas.getByRole("img", { name: `${hidden} more` })).toBeVisible();
    }
  },
};

export const Recipes = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { AvatarGroup },
    setup() {
      return { people: avatarGroupPeople };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="avatar-group-title">
        <header class="max-w-3xl">
          <h1 id="avatar-group-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Everyone counts, even off screen.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Show a few faces and a count that stays right when the list is a page of a larger set.</p>
        </header>

        <div class="mt-12 grid max-w-5xl gap-5 sm:grid-cols-2">
          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <div class="flex items-center gap-4">
              <AvatarGroup :items="people" :max="5" :total="128" aria-label="Maintainers" avatar-class="size-9" overflow-class="size-9" />
              <p class="text-sm"><strong>128 maintainers</strong> <span class="text-klean-muted">on the board</span></p>
            </div>
            <h2 class="mt-5 font-medium">Aggregate total</h2>
            <p class="mt-1 text-sm leading-6 text-klean-muted">Six people loaded, 128 counted.</p>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <AvatarGroup :items="people" aria-label="Reviewers" class="-space-x-3" avatar-class="size-12 rounded-xl" />
            <h2 class="mt-5 font-medium">Everyone shown</h2>
            <p class="mt-1 text-sm leading-6 text-klean-muted">No max, no overflow. Shape is a class.</p>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <AvatarGroup :items="people" :max="3" :total="9" aria-label="Team">
              <template #overflow="{ count }">
                <a href="#team" class="ml-3 self-center text-sm font-medium underline underline-offset-4">and {{ count }} others</a>
              </template>
            </AvatarGroup>
            <h2 class="mt-5 font-medium">Custom overflow</h2>
            <p class="mt-1 text-sm leading-6 text-klean-muted">Replace the count with a link to everyone.</p>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <AvatarGroup :items="people" :max="4" aria-label="Supporters" class="-space-x-1" avatar-class="size-7 ring-1" overflow-class="size-7 bg-gray-950 text-white ring-1 dark:bg-white dark:text-gray-950" />
            <h2 class="mt-5 font-medium">Compact</h2>
            <p class="mt-1 text-sm leading-6 text-klean-muted">Tighter spacing and a strong count.</p>
          </article>
        </div>
      </section>
    `,
  }),
};
