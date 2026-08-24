import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Tooltip from "../src/vue/tooltip/Tooltip.vue";

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function settle(milliseconds = 0) {
  if (milliseconds) await wait(milliseconds);
  await nextTick();
  await Promise.resolve();
}

function tooltipFor(trigger) {
  const ids = (trigger.getAttribute("aria-describedby") ?? "").split(/\s+/);
  return document.getElementById(
    ids.find((id) => id.startsWith("klean-tooltip-")),
  );
}

function mountTooltip(options = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const wrapper = mount(Tooltip, {
    attachTo: host,
    props: {
      text: options.text ?? "Re-run query",
      ...(options.props ?? {}),
    },
    attrs: options.attrs,
    slots: {
      default: () =>
        h(
          options.as ?? "button",
          {
            type: options.as === "a" ? undefined : "button",
            href: options.as === "a" ? "/query" : undefined,
            "aria-label": "Re-run query",
            "aria-describedby": options.describedBy,
            class: "size-9 rounded-lg",
          },
          "Run",
        ),
    },
  });
  const trigger = host.querySelector(options.as ?? "button");

  return {
    wrapper,
    trigger,
    content: () => tooltipFor(trigger),
    cleanup() {
      wrapper.unmount();
      host.remove();
    },
  };
}

test("wraps one semantic trigger without imposing visible trigger styling", async () => {
  const { wrapper, trigger, content, cleanup } = mountTooltip();
  await settle();

  expect(wrapper.get("span.contents").exists()).toBe(true);
  expect(trigger.tagName.toLowerCase()).toBe("button");
  expect(trigger.classList).toContain("size-9");
  expect(trigger.getAttribute("aria-label")).toBe("Re-run query");
  expect(content().getAttribute("role")).toBe("tooltip");
  expect(content().getAttribute("popover")).toBe("hint");
  expect(content().getAttribute("data-slot")).toBe("tooltip");
  expect(content().textContent).toContain("Re-run query");
  expect(content().classList).toContain("bg-gray-950");
  expect(content().classList).toContain("text-white");
  expect(content().classList).toContain("dark:bg-white");
  expect(content().classList).toContain("dark:text-gray-950");
  expect(content().classList).toContain("pointer-events-none");
  cleanup();
});

test("never lets supplementary text intercept an application action", () => {
  for (const file of [
    "registry/tooltip/vue/Tooltip.vue",
    "registry/tooltip/react/Tooltip.jsx",
    "registry/tooltip/svelte/Tooltip.svelte",
  ]) {
    const source = readFileSync(resolve(file), "utf8");
    expect(source).toContain("pointer-events-none z-50");
    expect(source).not.toMatch(/@pointerenter|onPointerEnter|onpointerenter/);
    expect(source).not.toMatch(/@pointerleave|onPointerLeave|onpointerleave/);
  }
});

test("generates and cleans up a supplementary aria description", async () => {
  const { trigger, content, cleanup } = mountTooltip({
    describedBy: "query-help",
  });
  await settle();

  const tooltipId = content().id;
  expect(trigger.getAttribute("aria-describedby")).toBe(
    `query-help ${tooltipId}`,
  );

  cleanup();
  expect(trigger.getAttribute("aria-describedby")).toBe("query-help");
});

test("opens from keyboard focus and Escape dismisses without moving focus", async () => {
  const { trigger, content, cleanup } = mountTooltip();
  await settle();

  trigger.focus();
  await settle(430);
  expect(content().getAttribute("data-state")).toBe("open");

  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  await settle();
  expect(content().getAttribute("data-state")).toBe("closed");
  expect(document.activeElement).toBe(trigger);
  cleanup();
});

test("points a calculated arrow back to the trigger on the resolved side", async () => {
  const { trigger, content, cleanup } = mountTooltip({
    props: { placement: "bottom" },
  });
  await settle();

  trigger.focus();
  await settle(430);

  const tooltip = content();
  const arrow = tooltip.querySelector('[data-slot="tooltip-arrow"]');
  const side = tooltip.getAttribute("data-placement").split("-")[0];
  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[side];

  expect(arrow.getAttribute("aria-hidden")).toBe("true");
  expect(arrow.classList).toContain("size-3");
  expect(arrow.classList).toContain("bg-inherit");
  expect(arrow.classList).toContain("pointer-events-none");
  expect(tooltip.classList).toContain("overflow-visible");
  expect(arrow.style.clipPath).toContain("polygon(");
  expect(arrow.style[staticSide]).toBe("-8px");
  cleanup();
});

test("opens for a mouse pointer but does not synthesize sticky touch hover", async () => {
  const mouse = mountTooltip({ text: "Mouse hint" });
  await settle();
  mouse.trigger.dispatchEvent(
    new PointerEvent("pointerover", {
      bubbles: true,
      composed: true,
      pointerType: "mouse",
    }),
  );
  await settle(430);
  expect(mouse.content().getAttribute("data-state")).toBe("open");
  mouse.cleanup();

  const touch = mountTooltip({ text: "Touch hint" });
  await settle();
  touch.trigger.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      composed: true,
      pointerType: "touch",
    }),
  );
  touch.trigger.focus();
  await settle(430);
  expect(touch.content().getAttribute("data-state")).toBe("closed");
  touch.cleanup();
});

test("lets ordinary classes restyle only the floating surface", async () => {
  const { trigger, content, cleanup } = mountTooltip({
    attrs: {
      class:
        "rounded-none border-2 border-amber-200 bg-amber-100 px-4 text-black shadow-none dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50",
    },
  });
  await settle();

  expect(content().classList).toContain("rounded-none");
  expect(content().classList).toContain("border-2");
  expect(content().classList).toContain("bg-amber-100");
  expect(content().classList).toContain("dark:bg-amber-950");
  expect(content().classList).toContain("dark:text-amber-50");
  expect(content().classList).toContain("shadow-none");
  expect(content().classList).not.toContain("rounded-md");
  expect(content().classList).not.toContain("bg-gray-950");
  expect(content().classList).not.toContain("dark:bg-white");
  expect([...trigger.classList]).toEqual(
    expect.arrayContaining(["size-9", "rounded-lg"]),
  );
  cleanup();
});

test("keeps experimental interest invokers out of the application contract", () => {
  const props = Tooltip.props ?? {};

  expect(props).toHaveProperty("text");
  expect(props).toHaveProperty("placement");
  expect(props).toHaveProperty("offset");
  expect(props).not.toHaveProperty("id");
  expect(props).not.toHaveProperty("triggerClass");
  expect(props).not.toHaveProperty("variant");
  expect(props).not.toHaveProperty("open");
});
