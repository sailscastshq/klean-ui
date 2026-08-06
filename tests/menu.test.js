import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import Menu from "../src/vue/menu/Menu.vue";

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function defaultItems(onRedeploy = () => {}) {
  return [
    h("button", { type: "button", disabled: true }, "Archive"),
    h("button", { type: "button", onClick: onRedeploy }, "Redeploy"),
    h("a", { href: "/deployments" }, "View deployments"),
  ];
}

async function mountMenu(options = {}) {
  const host = document.createElement("div");
  const trigger = document.createElement("button");
  const id = options.id ?? "project-actions";
  let cleanupRoot = host;

  trigger.type = "button";
  trigger.textContent = "Actions";
  trigger.setAttribute("popovertarget", id);
  host.append(trigger);

  if (options.dir) host.dir = options.dir;

  if (options.shadow) {
    const shadowHost = document.createElement("div");
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });
    shadowRoot.append(host);
    document.body.append(shadowHost);
    cleanupRoot = shadowHost;
  } else {
    document.body.append(host);
  }

  const wrapper = mount(Menu, {
    attachTo: host,
    props: { id, ...(options.props ?? {}) },
    attrs: options.attrs,
    slots: {
      default: options.items ?? (() => defaultItems(options.onRedeploy)),
    },
  });
  await settle();

  return {
    wrapper,
    trigger,
    root: options.shadow ? host.getRootNode() : document,
    cleanup() {
      wrapper.unmount();
      cleanupRoot.remove();
    },
  };
}

function focusedElement(root) {
  return root.activeElement ?? document.activeElement;
}

test("adds menu semantics while preserving native buttons and anchors", async () => {
  const { wrapper, trigger, cleanup } = await mountMenu({
    attrs: { "aria-label": "Project actions" },
  });
  const menu = wrapper.get('[data-slot="menu"]');
  const items = wrapper.findAll('[role="menuitem"]');

  expect(menu.attributes("role")).toBe("menu");
  expect(menu.attributes("aria-label")).toBe("Project actions");
  expect(menu.attributes("tabindex")).toBe("-1");
  expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
  expect(trigger.getAttribute("aria-controls")).toBe(menu.attributes("id"));
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(items.map((item) => item.element.tagName)).toEqual([
    "BUTTON",
    "BUTTON",
    "A",
  ]);
  expect(items[2].attributes("href")).toBe("/deployments");
  expect(items.every((item) => item.attributes("tabindex") === "-1")).toBe(
    true,
  );
  cleanup();
});

test("opens from the native invoker and focuses the first enabled item", async () => {
  const { wrapper, trigger, root, cleanup } = await mountMenu();

  trigger.click();
  await settle();

  const items = wrapper.findAll('[role="menuitem"]');
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(focusedElement(root)).toBe(items[1].element);
  expect(items[0].attributes("tabindex")).toBe("-1");
  expect(items[1].attributes("tabindex")).toBe("0");
  cleanup();
});

test("Arrow Down and Arrow Up open at the correct enabled edge", async () => {
  const first = await mountMenu();
  first.trigger.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  await settle();
  expect(focusedElement(first.root).textContent).toBe("Redeploy");
  first.cleanup();

  const last = await mountMenu();
  last.trigger.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
  );
  await settle();
  expect(focusedElement(last.root).textContent).toBe("View deployments");
  last.cleanup();
});

test("roves with arrows and Home or End while skipping disabled items", async () => {
  const { wrapper, trigger, root, cleanup } = await mountMenu();
  trigger.click();
  await settle();
  const focused = () => focusedElement(root);

  focused().dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  expect(focused().textContent).toBe("View deployments");

  focused().dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  expect(focused().textContent).toBe("Redeploy");

  focused().dispatchEvent(
    new KeyboardEvent("keydown", { key: "End", bubbles: true }),
  );
  expect(focused().textContent).toBe("View deployments");

  focused().dispatchEvent(
    new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
  );
  expect(focused().textContent).toBe("Redeploy");
  expect(wrapper.find("button[disabled]").attributes("tabindex")).toBe("-1");
  cleanup();
});

test("buffers printable-key typeahead and uses accessible item text", async () => {
  const { trigger, root, cleanup } = await mountMenu({
    items: () => [
      h("button", { type: "button" }, "Restart"),
      h("button", { type: "button", "aria-label": "Redeploy production" }, [
        h("svg", { "aria-hidden": "true" }),
      ]),
      h("a", { href: "/releases" }, "Release history"),
    ],
  });
  trigger.click();
  await settle();
  const focused = () => focusedElement(root);

  focused().dispatchEvent(
    new KeyboardEvent("keydown", { key: "r", bubbles: true }),
  );
  expect(focused().getAttribute("aria-label")).toBe("Redeploy production");

  focused().dispatchEvent(
    new KeyboardEvent("keydown", { key: "r", bubbles: true }),
  );
  expect(focused().textContent).toBe("Release history");
  cleanup();
});

test("selection closes once and returns focus without replacing item semantics", async () => {
  let selections = 0;
  const { wrapper, trigger, root, cleanup } = await mountMenu({
    onRedeploy: () => {
      selections += 1;
    },
  });
  trigger.click();
  await settle();

  await wrapper.findAll('[role="menuitem"]')[1].trigger("click");
  await settle();

  expect(selections).toBe(1);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(focusedElement(root)).toBe(trigger);
  cleanup();
});

test("aria-disabled links do not navigate or fire application handlers", async () => {
  let selections = 0;
  const { wrapper, trigger, cleanup } = await mountMenu({
    items: () => [
      h(
        "a",
        {
          href: "/danger",
          "aria-disabled": "true",
          onClick: () => {
            selections += 1;
          },
        },
        "Unavailable",
      ),
      h("button", { type: "button" }, "Available"),
    ],
  });
  trigger.click();
  await settle();

  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  wrapper.find("a").element.dispatchEvent(event);
  await settle();

  expect(event.defaultPrevented).toBe(true);
  expect(selections).toBe(0);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  cleanup();
});

test("Escape restores the invoker while Tab and outside interaction do not steal focus", async () => {
  const escape = await mountMenu();
  escape.trigger.click();
  await settle();
  focusedElement(escape.root).dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  await settle();
  expect(focusedElement(escape.root)).toBe(escape.trigger);
  escape.cleanup();

  const tab = await mountMenu();
  tab.trigger.click();
  await settle();
  focusedElement(tab.root).dispatchEvent(
    new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
  );
  await settle();
  expect(tab.trigger.getAttribute("aria-expanded")).toBe("false");
  expect(focusedElement(tab.root)).not.toBe(tab.trigger);
  tab.cleanup();

  const outside = await mountMenu();
  const outsideButton = document.createElement("button");
  document.body.append(outsideButton);
  outside.trigger.click();
  await settle();
  outsideButton.focus();
  outsideButton.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, composed: true }),
  );
  await settle();
  expect(outside.trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(outsideButton);
  outsideButton.remove();
  outside.cleanup();
});

test("keeps keyboard behavior inside Shadow DOM and in RTL", async () => {
  const { trigger, root, cleanup } = await mountMenu({ shadow: true, dir: "rtl" });
  trigger.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "ArrowUp",
      bubbles: true,
      composed: true,
    }),
  );
  await settle();

  expect(focusedElement(root).textContent).toBe("View deployments");
  focusedElement(root).dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      composed: true,
    }),
  );
  expect(focusedElement(root).textContent).toBe("Redeploy");
  cleanup();
});

test("lets consumer Tailwind classes win and keeps controlled state observable", async () => {
  const { wrapper, trigger, cleanup } = await mountMenu({
    props: { open: false },
    attrs: { class: "w-72 rounded-none p-3 shadow-none" },
  });
  const menu = wrapper.get('[data-slot="menu"]');

  expect(menu.classes()).toContain("w-72");
  expect(menu.classes()).toContain("rounded-none");
  expect(menu.classes()).toContain("p-3");
  expect(menu.classes()).toContain("shadow-none");
  expect(menu.classes()).not.toContain("p-1");
  expect(menu.classes()).not.toContain("p-4");
  expect(menu.classes()).not.toContain("rounded-md");

  trigger.click();
  await settle();
  expect(wrapper.emitted("update:open")).toEqual([[true]]);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  cleanup();
});
