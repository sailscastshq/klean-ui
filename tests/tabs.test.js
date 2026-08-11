import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import Tabs from "../src/vue/tabs/Tabs.vue";

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function tabMarkup(options = {}) {
  const values = options.values ?? ["overview", "activity", "settings"];
  return () => [
    h(
      "div",
      { class: "caller-list" },
      values.map((value) =>
        h(
          "button",
          {
            key: `tab-${value}`,
            "data-value": value,
            disabled: options.disabled === value,
            class: `caller-tab caller-${value}`,
          },
          value,
        ),
      ),
    ),
    ...values.map((value) =>
      h(
        "section",
        {
          key: `panel-${value}`,
          "data-value": value,
          class: `caller-panel panel-${value}`,
        },
        `${value} panel`,
      ),
    ),
  ];
}

function mountTabs(options = {}) {
  return mount(Tabs, {
    attachTo: document.body,
    props: {
      defaultValue: options.defaultValue,
      orientation: options.orientation,
      activation: options.activation,
      ...options.props,
    },
    attrs: {
      "aria-label": "Project sections",
      class: "caller-root",
    },
    slots: { default: options.slot ?? tabMarkup(options) },
  });
}

const BoringStackLink = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h("a", attrs, slots.default?.());
  },
});

test("enhances visible native buttons and panels with the complete tab relationship", async () => {
  const wrapper = mountTabs({ defaultValue: "activity" });
  await settle();
  const list = wrapper.get('[role="tablist"]');
  const tabs = wrapper.findAll('[role="tab"]');
  const panels = wrapper.findAll('[role="tabpanel"]');

  expect(wrapper.classes()).toContain("caller-root");
  expect(list.attributes("aria-label")).toBe("Project sections");
  expect(list.attributes("data-slot")).toBe("tabs-list");
  expect(tabs).toHaveLength(3);
  expect(panels).toHaveLength(3);
  expect(tabs[1].attributes("aria-selected")).toBe("true");
  expect(tabs[1].attributes("tabindex")).toBe("0");
  expect(tabs[0].attributes("tabindex")).toBe("-1");
  expect(tabs[1].attributes("aria-controls")).toBe(panels[1].attributes("id"));
  expect(panels[1].attributes("aria-labelledby")).toBe(
    tabs[1].attributes("id"),
  );
  expect(panels[1].attributes("hidden")).toBeUndefined();
  expect(panels[0].attributes()).toHaveProperty("hidden");
  expect(tabs[1].classes()).toContain("caller-activity");
  expect(panels[1].classes()).toContain("panel-activity");
  wrapper.unmount();
});

test("uses horizontal Arrow keys with automatic activation and skips disabled tabs", async () => {
  const wrapper = mountTabs({ defaultValue: "overview", disabled: "activity" });
  await settle();
  const tabs = wrapper.findAll('[role="tab"]');
  tabs[0].element.focus();
  await tabs[0].trigger("keydown", { key: "ArrowRight" });
  await settle();

  expect(document.activeElement).toBe(tabs[2].element);
  expect(tabs[2].attributes("aria-selected")).toBe("true");

  await tabs[2].trigger("keydown", { key: "ArrowRight" });
  await settle();
  expect(document.activeElement).toBe(tabs[0].element);
  wrapper.unmount();
});

test("keeps vertical manual focus separate until Enter or Space activates", async () => {
  const wrapper = mountTabs({
    defaultValue: "overview",
    orientation: "vertical",
    activation: "manual",
  });
  await settle();
  const list = wrapper.get('[role="tablist"]');
  const tabs = wrapper.findAll('[role="tab"]');

  expect(list.attributes("aria-orientation")).toBe("vertical");
  tabs[0].element.focus();
  await tabs[0].trigger("keydown", { key: "ArrowDown" });
  await settle();
  expect(document.activeElement).toBe(tabs[1].element);
  expect(tabs[0].attributes("aria-selected")).toBe("true");

  await tabs[1].trigger("keydown", { key: "Enter" });
  await settle();
  expect(tabs[1].attributes("aria-selected")).toBe("true");
  wrapper.unmount();
});

test("moves to the first and last enabled tab with Home and End", async () => {
  const wrapper = mountTabs({ defaultValue: "overview" });
  await settle();
  const tabs = wrapper.findAll('[role="tab"]');
  tabs[0].element.focus();

  await tabs[0].trigger("keydown", { key: "End" });
  await settle();
  expect(document.activeElement).toBe(tabs[2].element);
  expect(tabs[2].attributes("aria-selected")).toBe("true");

  await tabs[2].trigger("keydown", { key: "Home" });
  await settle();
  expect(document.activeElement).toBe(tabs[0].element);
  expect(tabs[0].attributes("aria-selected")).toBe("true");
  wrapper.unmount();
});

test("supports controlled values without owning URL or storage policy", async () => {
  const selected = ref("overview");
  const wrapper = mount(Tabs, {
    attachTo: document.body,
    props: {
      modelValue: selected.value,
      "onUpdate:modelValue": (value) => {
        selected.value = value;
        wrapper.setProps({ modelValue: value });
      },
    },
    attrs: { "aria-label": "Views" },
    slots: { default: tabMarkup() },
  });
  await settle();
  await wrapper.findAll('[role="tab"]')[2].trigger("click");
  await settle();

  expect(selected.value).toBe("settings");
  expect(wrapper.emitted("update:modelValue").at(-1)).toEqual(["settings"]);
  expect(wrapper.emitted("change").at(-1)).toEqual(["settings"]);
  expect(wrapper.html()).not.toMatch(/localStorage|sessionStorage|pushState/);
  wrapper.unmount();
});

test("enhances native anchors and framework Links without replacing navigation semantics", async () => {
  const wrapper = mount(Tabs, {
    attachTo: document.body,
    props: { modelValue: "billing", orientation: "vertical" },
    attrs: { "aria-label": "Account settings" },
    slots: {
      default: () => [
        h("nav", { class: "settings-nav" }, [
          h(
            "a",
            {
              href: "/settings/profile",
              "data-value": "profile",
              class: "profile-link",
            },
            "Profile",
          ),
          h(
            BoringStackLink,
            {
              href: "/settings/billing",
              "data-value": "billing",
              prefetch: "",
              class: "billing-link",
            },
            () => "Billing",
          ),
        ]),
      ],
    },
  });
  await settle();

  const root = wrapper.get('[data-slot="tabs"]');
  const navigation = wrapper.get("nav");
  const links = wrapper.findAll("a[data-value]");

  expect(root.attributes("data-mode")).toBe("navigation");
  expect(navigation.attributes("data-mode")).toBe("navigation");
  expect(navigation.attributes("aria-label")).toBe("Account settings");
  expect(navigation.attributes("role")).toBeUndefined();
  expect(navigation.attributes("aria-orientation")).toBeUndefined();
  expect(links[0].attributes("href")).toBe("/settings/profile");
  expect(links[1].attributes("href")).toBe("/settings/billing");
  expect(links[1].attributes()).toHaveProperty("prefetch");
  expect(links[0].attributes("data-state")).toBe("inactive");
  expect(links[1].attributes("data-state")).toBe("active");
  expect(links[1].attributes("aria-current")).toBe("page");
  expect(links[0].attributes("role")).toBeUndefined();
  expect(links[0].attributes("aria-selected")).toBeUndefined();
  expect(links[0].attributes("tabindex")).toBeUndefined();

  links[0].element.focus();
  const arrow = new KeyboardEvent("keydown", {
    key: "ArrowDown",
    bubbles: true,
    cancelable: true,
  });
  links[0].element.dispatchEvent(arrow);
  expect(arrow.defaultPrevented).toBe(false);
  expect(document.activeElement).toBe(links[0].element);

  for (const modifier of [
    undefined,
    "metaKey",
    "ctrlKey",
    "shiftKey",
    "altKey",
  ]) {
    const click = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      ...(modifier ? { [modifier]: true } : {}),
    });
    links[0].element.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
  }
  expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  expect(wrapper.emitted("change")).toBeUndefined();
  wrapper.unmount();
});

test("infers an uncontrolled navigation value from caller-owned aria-current", async () => {
  const wrapper = mount(Tabs, {
    attachTo: document.body,
    slots: {
      default: () => [
        h("nav", { "aria-label": "Settings destinations" }, [
          h(
            "a",
            {
              href: "/settings/profile",
              "data-value": "profile",
              "aria-current": "page",
            },
            "Profile",
          ),
          h(
            "a",
            { href: "/settings/billing", "data-value": "billing" },
            "Billing",
          ),
        ]),
      ],
    },
  });
  await settle();

  expect(wrapper.get('a[data-value="profile"]').attributes("data-state")).toBe(
    "active",
  );
  expect(
    wrapper.get('a[data-value="billing"]').attributes("aria-current"),
  ).toBeUndefined();
  expect(wrapper.get("nav").attributes("aria-label")).toBe(
    "Settings destinations",
  );
  wrapper.unmount();
});

test("does not guess semantics for a mixed button and link group", async () => {
  const wrapper = mount(Tabs, {
    attachTo: document.body,
    slots: {
      default: () => [
        h("div", [
          h("button", { "data-value": "local" }, "Local"),
          h("a", { href: "/remote", "data-value": "remote" }, "Remote"),
        ]),
      ],
    },
  });
  await settle();

  expect(wrapper.attributes("data-mode")).toBe("mixed");
  expect(wrapper.find('[role="tablist"]').exists()).toBe(false);
  expect(wrapper.find('[role="tab"]').exists()).toBe(false);
  expect(wrapper.find("[data-state]").exists()).toBe(false);
  wrapper.unmount();
});

test("falls forward when the active dynamic tab is removed", async () => {
  const values = ref(["one", "two", "three"]);
  const wrapper = mount(Tabs, {
    attachTo: document.body,
    props: { defaultValue: "two" },
    attrs: { "aria-label": "Queries" },
    slots: { default: () => tabMarkup({ values: values.value })() },
  });
  await settle();
  const active = wrapper.find('[role="tab"][data-value="two"]');
  active.element.focus();
  values.value = ["one", "three"];
  await settle();

  const next = wrapper.find('[role="tab"][data-value="three"]');
  expect(next.attributes("aria-selected")).toBe("true");
  expect(document.activeElement).toBe(next.element);
  wrapper.unmount();
});

test("falls to an enabled neighbor when the active tab becomes disabled", async () => {
  const disabled = ref();
  const wrapper = mount(Tabs, {
    attachTo: document.body,
    props: { defaultValue: "activity" },
    attrs: { "aria-label": "Views" },
    slots: {
      default: () => tabMarkup({ disabled: disabled.value })(),
    },
  });
  await settle();
  disabled.value = "activity";
  await settle();

  expect(
    wrapper
      .get('[role="tab"][data-value="settings"]')
      .attributes("aria-selected"),
  ).toBe("true");
  expect(
    wrapper.get('[role="tab"][data-value="activity"]').attributes("tabindex"),
  ).toBe("-1");
  wrapper.unmount();
});

test("enhances inserted tabs and keeps relationships stable through reorder", async () => {
  const values = ref(["one", "two"]);
  const wrapper = mount(Tabs, {
    attachTo: document.body,
    props: { defaultValue: "two" },
    attrs: { "aria-label": "Queries" },
    slots: { default: () => tabMarkup({ values: values.value })() },
  });
  await settle();
  values.value = ["three", "two", "one"];
  await settle();

  const tabs = wrapper.findAll('[role="tab"]');
  const panels = wrapper.findAll('[role="tabpanel"]');
  expect(tabs).toHaveLength(3);
  expect(new Set(tabs.map((tab) => tab.attributes("id"))).size).toBe(3);
  expect(
    wrapper.get('[role="tab"][data-value="two"]').attributes("aria-selected"),
  ).toBe("true");
  for (const tab of tabs) {
    expect(
      panels.some(
        (panel) => panel.attributes("id") === tab.attributes("aria-controls"),
      ),
    ).toBe(true);
  }
  wrapper.unmount();
});

test("keeps framework and visual ceremony out of the public API", () => {
  const props = Tabs.props ?? {};
  expect(Object.keys(props)).toEqual(
    expect.arrayContaining([
      "modelValue",
      "defaultValue",
      "orientation",
      "activation",
    ]),
  );
  expect(props).not.toHaveProperty("items");
  expect(props).not.toHaveProperty("variant");
  expect(props).not.toHaveProperty("persist");
  expect(props).not.toHaveProperty("router");
  expect(props).not.toHaveProperty("listClass");
  expect(props).not.toHaveProperty("triggerClass");
});
