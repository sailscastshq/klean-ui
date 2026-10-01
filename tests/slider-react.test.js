import { expect, test } from "@rstest/core";
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import Slider from "../registry/slider/react/Slider.jsx";

async function fixture(props) {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const form = document.createElement("form");
  document.body.append(form);
  const root = createRoot(form);
  await act(async () => root.render(createElement(Slider, props)));
  return {
    form,
    inputs: [...form.querySelectorAll("input")],
    async close() {
      await act(async () => root.unmount());
      form.remove();
    },
  };
}

test("React Slider constrains keyboard range endpoints and preserves form values", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  let next;
  await act(async () =>
    root.render(
      createElement(Slider, {
        value: [20, 80],
        minStepsBetween: 5,
        labels: ["Minimum budget", "Maximum budget"],
        name: ["minimum", "maximum"],
        onChange: (value) => {
          next = value;
        },
      }),
    ),
  );
  const input = container.querySelector("input");
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "End",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(next).toEqual([75, 80]);
  expect(input.value).toBe("20");
  await act(async () => root.unmount());
  container.remove();
});

test("React Slider uncontrolled values reset both endpoints and submit native names", async () => {
  const view = await fixture({
    defaultValue: [20, 80],
    name: ["minimum", "maximum"],
  });
  await act(async () =>
    view.inputs[0].dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "End",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(view.inputs[0].value).toBe("80");
  await act(async () => view.form.reset());
  expect(view.inputs.map((input) => input.value)).toEqual(["20", "80"]);
  expect([...new FormData(view.form)]).toEqual([
    ["minimum", "20"],
    ["maximum", "80"],
  ]);
  await view.close();
});

test("React Slider respects prevented reset and native disabled state", async () => {
  const view = await fixture({ defaultValue: 40 });
  view.form.addEventListener("reset", (event) => event.preventDefault());
  await act(async () =>
    view.inputs[0].dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "PageUp",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  await act(async () => view.form.reset());
  expect(view.inputs[0].value).toBe("50");
  await view.close();
  const disabled = await fixture({ defaultValue: 40, disabled: true });
  await act(async () =>
    disabled.inputs[0].dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "End",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(disabled.inputs[0].value).toBe("40");
  await disabled.close();
});
