import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { nextTick, ref, shallowRef } from "vue";
import Command from "../src/vue/command/Command.vue";

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function key(element, value, options = {}) {
  const event = new KeyboardEvent("keydown", {
    key: value,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
  return event;
}

async function mountCommand({ filter, groups } = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const selected = shallowRef();
  const escapes = ref(0);
  const backs = ref(0);
  const commands = ref([
    {
      id: "deploy",
      title: "Deploy app",
      keywords: ["ship", "release"],
      group: "Actions",
      shortcut: "⌘D",
    },
    {
      id: "retire",
      title: "Retire service",
      group: "Actions",
      disabled: true,
    },
    {
      id: "billing",
      title: "Open billing",
      keywords: ["invoice"],
      group: "Navigation",
      route: "/settings/billing",
    },
  ]);

  const wrapper = mount(
    {
      components: { Command },
      setup() {
        function handleEscape(event) {
          escapes.value += 1;
          event.preventDefault();
        }
        function handleBack(event) {
          backs.value += 1;
          event.preventDefault();
        }
        return {
          backs,
          commands,
          escapes,
          filter,
          groups,
          handleBack,
          handleEscape,
          selected,
        };
      },
      template: `
        <Command
          id="test-command"
          :commands="commands"
          :groups="groups"
          :filter="filter"
          label="Commands"
          class="rounded-none border-2"
          @escape="handleEscape"
          @back="handleBack"
          @select="selected = $event"
        />
      `,
    },
    { attachTo: host },
  );
  await settle();

  return {
    wrapper,
    input: wrapper.get('[data-slot="command-input"]'),
    commands,
    selected,
    escapes,
    backs,
    cleanup() {
      wrapper.unmount();
      host.remove();
    },
  };
}

test("renders one accessible combobox/listbox surface from command records", async () => {
  const { wrapper, input, cleanup } = await mountCommand();
  const list = wrapper.get('[role="listbox"]');
  const visible = wrapper.findAll('[role="option"]');

  expect(input.attributes("role")).toBe("combobox");
  expect(input.attributes("aria-label")).toBe("Commands");
  expect(input.attributes("aria-autocomplete")).toBe("list");
  expect(input.attributes("aria-controls")).toBe(list.attributes("id"));
  expect(input.attributes("aria-expanded")).toBe("true");
  expect(visible).toHaveLength(3);
  expect(wrapper.findAll('[role="group"]')).toHaveLength(2);
  expect(wrapper.get('[role="group"]').attributes("aria-labelledby")).toBe(
    wrapper.get('[data-slot="command-group-heading"]').attributes("id"),
  );
  expect(input.attributes("aria-activedescendant")).toBe(
    wrapper.get("[data-highlighted]").attributes("id"),
  );
  cleanup();
});

test("filters title and keywords while preserving real input focus", async () => {
  const { wrapper, input, cleanup } = await mountCommand();
  input.element.focus();
  await input.setValue("invoice");
  await settle();

  const visible = wrapper.findAll('[role="option"]');
  expect(visible).toHaveLength(1);
  expect(visible[0].text()).toContain("Open billing");
  expect(document.activeElement).toBe(input.element);
  expect(input.attributes("aria-activedescendant")).toBe(
    visible[0].attributes("id"),
  );
  cleanup();
});

test("skips disabled commands, wraps, and emits the original record", async () => {
  const { wrapper, input, selected, cleanup } = await mountCommand();
  input.element.focus();

  key(input.element, "ArrowDown");
  await settle();
  expect(wrapper.get("[data-highlighted]").text()).toContain("Open billing");

  key(input.element, "ArrowDown");
  await settle();
  expect(wrapper.get("[data-highlighted]").text()).toContain("Deploy app");

  key(input.element, "End");
  key(input.element, "Enter");
  await settle();
  expect(selected.value.id).toBe("billing");
  expect(selected.value.route).toBe("/settings/billing");
  expect(document.activeElement).toBe(input.element);
  cleanup();
});

test("Escape clears search first and delegates empty-query dismissal", async () => {
  const { wrapper, input, escapes, cleanup } = await mountCommand();
  input.element.focus();
  await input.setValue("deploy");

  const firstEscape = key(input.element, "Escape");
  await settle();
  expect(firstEscape.defaultPrevented).toBe(true);
  expect(input.element.value).toBe("");
  expect(escapes.value).toBe(0);
  expect(wrapper.get("[data-highlighted]").text()).toContain("Deploy app");

  const secondEscape = key(input.element, "Escape");
  await settle();
  expect(escapes.value).toBe(1);
  expect(secondEscape.defaultPrevented).toBe(true);
  cleanup();
});

test("empty-query Backspace delegates nested-flow navigation", async () => {
  const { input, backs, cleanup } = await mountCommand();
  input.element.focus();
  const event = key(input.element, "Backspace");
  await settle();

  expect(backs.value).toBe(1);
  expect(event.defaultPrevented).toBe(true);
  cleanup();
});

test("recovers when dynamic permissions remove the active command", async () => {
  const { wrapper, input, commands, cleanup } = await mountCommand();
  expect(wrapper.get("[data-highlighted]").text()).toContain("Deploy app");

  commands.value = commands.value.filter((command) => command.id !== "deploy");
  await settle();

  expect(wrapper.get("[data-highlighted]").text()).toContain("Open billing");
  expect(input.attributes("aria-activedescendant")).toBe(
    wrapper.get("[data-highlighted]").attributes("id"),
  );
  cleanup();
});

test("keeps caller Tailwind, item slots, and pointer activation pragmatic", async () => {
  const { wrapper, input, selected, cleanup } = await mountCommand();
  expect(wrapper.get('[data-slot="command"]').classes()).toContain(
    "rounded-none",
  );
  expect(wrapper.get('[data-slot="command"]').classes()).toContain("border-2");
  expect(wrapper.get('[data-slot="command"]').classes()).not.toContain(
    "rounded-lg",
  );

  input.element.focus();
  const item = wrapper.findAll('[role="option"]')[2];
  await item.trigger("mousedown");
  await item.trigger("click");
  await settle();
  expect(selected.value.id).toBe("billing");
  expect(document.activeElement).toBe(input.element);
  cleanup();
});

test("accepts a boolean application filter without owning fuzzy ranking", async () => {
  const filter = (command, query) =>
    !query || command.title.toLocaleLowerCase().startsWith(query.toLowerCase());
  const { wrapper, input, cleanup } = await mountCommand({ filter });
  await input.setValue("open");
  await settle();

  const visible = wrapper.findAll('[role="option"]');
  expect(visible).toHaveLength(1);
  expect(visible[0].text()).toContain("Open billing");
  cleanup();
});

test("preserves caller-filtered groups for application-owned Recent and ranking", async () => {
  const recent = {
    id: "deploy",
    title: "Deploy app",
    action: () => "deploy",
  };
  const project = {
    id: "project-storefront",
    title: "Storefront",
    subtitle: "Production",
    children: () => [],
  };
  const groups = { Recent: [recent], Projects: [project] };
  const { wrapper, input, selected, cleanup } = await mountCommand({ groups });

  expect(
    wrapper
      .findAll('[data-slot="command-group-heading"]')
      .map((heading) => heading.text()),
  ).toEqual(["Recent", "Projects"]);
  await input.setValue("a fuzzy typo already handled by the app");
  await settle();
  expect(wrapper.findAll('[role="option"]')).toHaveLength(2);
  key(input.element, "Enter");
  await settle();
  expect(selected.value).toBe(recent);
  expect(selected.value.action()).toBe("deploy");
  cleanup();
});
