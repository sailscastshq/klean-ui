import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { h, nextTick, createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { readFileSync } from "node:fs";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import ContextMenu from "../src/vue/context-menu/ContextMenu.vue";
import { spawnSync } from "node:child_process";

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}
async function fixture(props = {}) {
  const host = document.createElement("div");
  const target = document.createElement("div");
  target.id = "context-target";
  target.tabIndex = 0;
  target.getBoundingClientRect = () => ({
    left: 50,
    bottom: 100,
    top: 50,
    right: 250,
    width: 200,
    height: 50,
    x: 50,
    y: 50,
  });
  host.append(target);
  document.body.append(host);
  const wrapper = mount(ContextMenu, {
    attachTo: host,
    props: { target: target.id, id: "context-actions", ...props },
    attrs: { "aria-label": "Project actions", class: "w-52" },
    slots: {
      default: () => [
        h("button", { disabled: true }, "Archive"),
        h("button", {}, "Rename"),
        h("a", { href: "/projects" }, "Open"),
      ],
    },
  });
  await settle();
  return {
    target,
    wrapper,
    cleanup() {
      wrapper.unmount();
      host.remove();
    },
  };
}
test("right-click opens at the pointer, focuses the first enabled item, and restores focus after selection", async () => {
  const { target, wrapper, cleanup } = await fixture();
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: 175,
    clientY: 125,
  });
  target.dispatchEvent(event);
  await settle();
  expect(event.defaultPrevented).toBe(true);
  expect(wrapper.get('[role="menu"]').attributes("data-state")).toBe("open");
  expect(target.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement.textContent).toBe("Rename");
  expect(
    wrapper
      .findComponent({ name: "Popover" })
      .props("anchor")
      .getBoundingClientRect(),
  ).toMatchObject({ left: 175, top: 125, width: 0 });
  await wrapper.get("button:not(:disabled)").trigger("click");
  await settle();
  expect(target.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(target);
  cleanup();
});
test("ContextMenu key and Shift+F10 use target geometry and Escape returns focus", async () => {
  const { target, wrapper, cleanup } = await fixture();
  for (const options of [
    { key: "ContextMenu" },
    { key: "F10", shiftKey: true },
  ]) {
    target.focus();
    const event = new KeyboardEvent("keydown", {
      ...options,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    await settle();
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement.textContent).toBe("Rename");
    expect(
      wrapper
        .findComponent({ name: "Popover" })
        .props("anchor")
        .getBoundingClientRect(),
    ).toMatchObject({ left: 50, top: 100 });
    await wrapper.get('[role="menu"]').trigger("keydown", { key: "Escape" });
    await settle();
    expect(document.activeElement).toBe(target);
  }
  cleanup();
});
test("disabled, native disabled, aria-disabled, and caller-prevented events preserve the browser menu", async () => {
  const { target, wrapper, cleanup } = await fixture({ disabled: true });
  async function check() {
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    await settle();
    expect(event.defaultPrevented).toBe(false);
    expect(target.getAttribute("aria-expanded")).toBe("false");
  }
  await check();
  await wrapper.setProps({ disabled: false });
  target.setAttribute("aria-disabled", "true");
  await check();
  target.removeAttribute("aria-disabled");
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
  });
  event.preventDefault();
  target.dispatchEvent(event);
  await settle();
  expect(target.getAttribute("aria-expanded")).toBe("false");
  cleanup();
  const button = document.createElement("button");
  button.id = "disabled-context";
  button.disabled = true;
  document.body.append(button);
  const native = mount(ContextMenu, {
    props: { target: button.id },
    attachTo: document.body,
  });
  await settle();
  const disabledEvent = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
  });
  button.dispatchEvent(disabledEvent);
  await settle();
  expect(disabledEvent.defaultPrevented).toBe(false);
  native.unmount();
  button.remove();
});
test("outside dismissal, controlled state, normal action button, attributes and cleanup preserve the contract", async () => {
  const { target, wrapper, cleanup } = await fixture();
  target.setAttribute("aria-haspopup", "menu");
  wrapper.vm.show();
  await settle();
  expect(wrapper.get('[role="menu"]').attributes("aria-label")).toBe(
    "Project actions",
  );
  expect(wrapper.get('[role="menu"]').classes()).toContain("w-52");
  document.body.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true }),
  );
  await settle();
  expect(target.getAttribute("aria-expanded")).toBe("false");
  await wrapper.setProps({ open: false });
  wrapper.vm.show();
  await settle();
  expect(wrapper.emitted("update:open").at(-1)).toEqual([true]);
  expect(target.getAttribute("aria-expanded")).toBe("false");
  await wrapper.setProps({ open: true });
  await settle();
  wrapper.vm.hide();
  await settle();
  expect(wrapper.emitted("update:open").at(-1)).toEqual([false]);
  cleanup();
  expect(target.hasAttribute("aria-controls")).toBe(false);
});
test("server rendering is closed and does not touch document or position until mounted", async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          ContextMenu,
          { target: "project" },
          { default: () => h("button", {}, "Rename") },
        ),
    }),
  );
  expect(html).toContain('role="menu"');
  expect(html).toContain('data-state="closed"');
  expect(html).toContain("Rename");
  const react = readFileSync(
    "registry/context-menu/react/ContextMenu.jsx",
    "utf8",
  );
  expect(() =>
    parse(react, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  const svelte = compile(
    readFileSync("registry/context-menu/svelte/ContextMenu.svelte", "utf8"),
    { filename: "ContextMenu.svelte", generate: "server" },
  );
  expect(svelte.warnings).toEqual([]);
});

test("React and Svelte SSR run without browser globals", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/check-context-menu-ssr.mjs"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("react: closed ContextMenu SSR succeeds");
  expect(result.stdout).toContain("svelte: closed ContextMenu SSR succeeds");
});

test("changing target restores old semantics and binds the new element; unmount removes listeners", async () => {
  const { target, wrapper, cleanup } = await fixture();
  const next = document.createElement("button");
  next.id = "next-context";
  next.setAttribute("aria-haspopup", "dialog");
  document.body.append(next);
  await wrapper.setProps({ target: next.id });
  expect(target.hasAttribute("aria-controls")).toBe(false);
  const oldEvent = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(oldEvent);
  expect(oldEvent.defaultPrevented).toBe(false);
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
  });
  next.dispatchEvent(event);
  await settle();
  expect(event.defaultPrevented).toBe(true);
  expect(next.getAttribute("aria-expanded")).toBe("true");
  cleanup();
  expect(next.getAttribute("aria-haspopup")).toBe("dialog");
  const after = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
  });
  next.dispatchEvent(after);
  expect(after.defaultPrevented).toBe(false);
  next.remove();
});

test("React and Svelte server render in a process without browser globals", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/check-context-menu-ssr.mjs"],
    { encoding: "utf8" },
  );
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain(
    "react: closed ContextMenu SSR succeeds without document",
  );
  expect(result.stdout).toContain(
    "svelte: closed ContextMenu SSR succeeds without document",
  );
});

test("native popover readiness focuses the first enabled item and retains the real invocation source", async () => {
  const matches = Element.prototype.matches;
  const showDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "showPopover",
  );
  const hideDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "hidePopover",
  );
  let source;
  Object.defineProperty(HTMLElement.prototype, "showPopover", {
    configurable: true,
    value(options) {
      source = options.source;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "hidePopover", {
    configurable: true,
    value() {
      this.removeAttribute("data-test-showing");
    },
  });
  Element.prototype.matches = function (selector) {
    return matches.call(
      this,
      selector === ":popover-open" ? "[data-test-showing]" : selector,
    );
  };
  let cleanup;
  try {
    const fixtureResult = await fixture();
    cleanup = fixtureResult.cleanup;
    const { target, wrapper } = fixtureResult;
    target.focus();
    wrapper.vm.show();
    await settle();
    expect(document.activeElement).toBe(target);
    const surface = wrapper.get('[role="menu"]').element;
    expect(surface.getAttribute("popover")).toBe("manual");
    expect(source).toBe(target);
    surface.setAttribute("data-test-showing", "");
    const toggle = new Event("toggle");
    Object.defineProperty(toggle, "newState", { value: "open" });
    surface.dispatchEvent(toggle);
    await settle();
    expect(document.activeElement.textContent).toBe("Rename");
    await wrapper.get('[role="menu"]').trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement.textContent).toBe("Open");
    // A duplicate readiness callback must not reset an already-consumed focus request.
    surface.dispatchEvent(toggle);
    await settle();
    expect(document.activeElement.textContent).toBe("Open");
  } finally {
    cleanup?.();
    Element.prototype.matches = matches;
    if (showDescriptor)
      Object.defineProperty(
        HTMLElement.prototype,
        "showPopover",
        showDescriptor,
      );
    else delete HTMLElement.prototype.showPopover;
    if (hideDescriptor)
      Object.defineProperty(
        HTMLElement.prototype,
        "hidePopover",
        hideDescriptor,
      );
    else delete HTMLElement.prototype.hidePopover;
  }
});
