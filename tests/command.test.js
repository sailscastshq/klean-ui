import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import Command from "../src/vue/command/Command.vue";
import CommandEmpty from "../src/vue/command/CommandEmpty.vue";
import CommandGroup from "../src/vue/command/CommandGroup.vue";
import CommandInput from "../src/vue/command/CommandInput.vue";
import CommandItem from "../src/vue/command/CommandItem.vue";
import CommandList from "../src/vue/command/CommandList.vue";
import CommandShortcut from "../src/vue/command/CommandShortcut.vue";

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

async function mountCommand({ filter } = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const selected = ref();
  const escapes = ref(0);
  const backs = ref(0);
  const showDeploy = ref(true);

  const wrapper = mount(
    {
      components: {
        Command,
        CommandEmpty,
        CommandGroup,
        CommandInput,
        CommandItem,
        CommandList,
        CommandShortcut,
      },
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
          escapes,
          filter,
          handleBack,
          handleEscape,
          selected,
          showDeploy,
        };
      },
      template: `
        <Command
          id="test-command"
          :filter="filter"
          class="rounded-none border-2"
          @escape="handleEscape"
          @back="handleBack"
          @select="selected = $event"
        >
          <CommandInput aria-label="Commands" />
          <CommandList aria-label="Available commands">
            <CommandEmpty>Nothing useful here.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem
                v-if="showDeploy"
                value="Deploy app"
                :keywords="['ship', 'release']"
                @select="selected = 'deploy'"
              >
                Deploy app
                <CommandShortcut>⌘D</CommandShortcut>
              </CommandItem>
              <CommandItem value="Retire service" disabled>Retire service</CommandItem>
              <CommandItem value="Open billing" :keywords="['invoice']" @select="selected = 'billing'">
                Open billing
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      `,
    },
    { attachTo: host },
  );
  await settle();

  return {
    wrapper,
    input: wrapper.get('[data-slot="command-input"]'),
    selected,
    escapes,
    backs,
    showDeploy,
    cleanup() {
      wrapper.unmount();
      host.remove();
    },
  };
}

test("connects one focused combobox input to a grouped listbox", async () => {
  const { wrapper, input, cleanup } = await mountCommand();
  const list = wrapper.get('[role="listbox"]');
  const visible = wrapper.findAll('[role="option"]:not([hidden])');

  expect(input.attributes("role")).toBe("combobox");
  expect(input.attributes("aria-autocomplete")).toBe("list");
  expect(input.attributes("aria-controls")).toBe(list.attributes("id"));
  expect(input.attributes("aria-expanded")).toBe("true");
  expect(visible).toHaveLength(3);
  expect(wrapper.get('[role="group"]').attributes("aria-labelledby")).toBe(
    wrapper.get('[data-slot="command-group-heading"]').attributes("id"),
  );
  expect(input.attributes("aria-activedescendant")).toBe(
    wrapper.get("[data-highlighted]").attributes("id"),
  );
  cleanup();
});

test("filters normalized text and keywords while preserving input focus", async () => {
  const { wrapper, input, cleanup } = await mountCommand();
  input.element.focus();
  await input.setValue("invoice");
  await settle();

  const visible = wrapper.findAll('[role="option"]:not([hidden])');
  expect(visible).toHaveLength(1);
  expect(visible[0].text()).toContain("Open billing");
  expect(document.activeElement).toBe(input.element);
  expect(input.attributes("aria-activedescendant")).toBe(
    visible[0].attributes("id"),
  );
  cleanup();
});

test("skips disabled commands, wraps, and activates with Enter", async () => {
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
  expect(selected.value).toBe("Open billing");
  expect(document.activeElement).toBe(input.element);
  cleanup();
});

test("Escape clears search first and delegates an empty-query close to the app", async () => {
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

test("empty-query Backspace delegates nested-flow navigation without owning a stack", async () => {
  const { input, backs, cleanup } = await mountCommand();
  input.element.focus();
  const event = key(input.element, "Backspace");
  await settle();

  expect(backs.value).toBe(1);
  expect(event.defaultPrevented).toBe(true);
  cleanup();
});

test("recovers the active descendant when dynamic permissions remove an item", async () => {
  const { wrapper, input, showDeploy, cleanup } = await mountCommand();
  expect(wrapper.get("[data-highlighted]").text()).toContain("Deploy app");

  showDeploy.value = false;
  await settle();

  expect(wrapper.get("[data-highlighted]").text()).toContain("Open billing");
  expect(input.attributes("aria-activedescendant")).toBe(
    wrapper.get("[data-highlighted]").attributes("id"),
  );
  cleanup();
});

test("keeps caller Tailwind classes and item activation pragmatic", async () => {
  const { wrapper, input, selected, cleanup } = await mountCommand();
  expect(wrapper.get('[data-slot="command"]').classes()).toContain(
    "rounded-none",
  );
  expect(wrapper.get('[data-slot="command"]').classes()).toContain("border-2");
  expect(wrapper.get('[data-slot="command"]').classes()).not.toContain(
    "rounded-lg",
  );

  input.element.focus();
  const item = wrapper.findAll('[role="option"]:not([hidden])')[2];
  await item.trigger("mousedown");
  await item.trigger("click");
  await settle();
  expect(selected.value).toBe("Open billing");
  expect(document.activeElement).toBe(input.element);
  cleanup();
});

test("allows application-owned filtering without a fuzzy-search dependency", async () => {
  const filter = (value, query) =>
    !query || value.toLocaleLowerCase().startsWith(query.toLocaleLowerCase());
  const { wrapper, input, cleanup } = await mountCommand({ filter });
  await input.setValue("open");
  await settle();

  const visible = wrapper.findAll('[role="option"]:not([hidden])');
  expect(visible).toHaveLength(1);
  expect(visible[0].text()).toContain("Open billing");
  cleanup();
});
