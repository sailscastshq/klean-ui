import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import LineChart from "../src/vue/line-chart/LineChart.vue";
import Sparkline from "../src/vue/sparkline/Sparkline.vue";

function registrySource(component, framework, filename) {
  return readFileSync(
    resolve(`registry/${component}/${framework}/${filename}`),
    "utf8",
  );
}

const signups = [
  { label: "Fri", value: 4, detail: "Friday, 4 signups" },
  { label: "Sat", value: 4, detail: "Saturday, 4 signups" },
  { label: "Sun", value: 9, detail: "Sunday, 9 signups" },
  { label: "Mon", value: 9, detail: "Monday, 9 signups" },
  { label: "Tue", value: 4, detail: "Tuesday, 4 signups" },
  { label: "Wed", value: 4, detail: "Wednesday, 4 signups" },
  { label: "Thu", value: 4, detail: "Thursday, 4 signups" },
];

test("renders a decorative native-SVG sparkline by default", () => {
  const wrapper = mount(Sparkline, { props: { data: signups } });

  expect(wrapper.element.tagName.toLowerCase()).toBe("svg");
  expect(wrapper.attributes("data-slot")).toBe("sparkline");
  expect(wrapper.attributes("aria-hidden")).toBe("true");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(wrapper.get("polyline").attributes("stroke")).toBe("currentColor");
  expect(wrapper.get("polyline").attributes("points")).not.toMatch(
    /NaN|Infinity/,
  );
});

test("makes a sparkline informative only when the caller labels it", () => {
  const wrapper = mount(Sparkline, {
    props: { data: signups, label: "Signups trend for the last seven days" },
    attrs: { class: "h-8 w-40 text-emerald-600" },
  });

  expect(wrapper.attributes("role")).toBe("img");
  expect(wrapper.attributes("aria-label")).toBe(
    "Signups trend for the last seven days",
  );
  expect(wrapper.attributes("aria-hidden")).toBeUndefined();
  expect(wrapper.classes()).toContain("h-8");
  expect(wrapper.classes()).toContain("w-40");
  expect(wrapper.classes()).not.toContain("h-6");
  expect(wrapper.classes()).not.toContain("w-30");
});

test("renders a captioned line chart with an exact data alternative", () => {
  const wrapper = mount(LineChart, {
    props: { data: signups, caption: "Signups — last 7 days" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("figure");
  expect(wrapper.attributes("data-slot")).toBe("line-chart");
  expect(wrapper.get("figcaption").text()).toBe("Signups — last 7 days");
  expect(wrapper.get("svg").attributes("aria-hidden")).toBe("true");
  expect(wrapper.get('[data-slot="line-chart-line"]').element.tagName).toBe(
    "path",
  );
  expect(
    wrapper.get('[data-slot="line-chart-line"]').attributes("d"),
  ).toContain("Q");
  expect(
    wrapper.get('[data-slot="line-chart-line"]').attributes("stroke"),
  ).toBe("currentColor");
  expect(wrapper.findAll('[data-slot="line-chart-guide"]')).toHaveLength(3);
  expect(wrapper.get('[data-slot="line-chart-scale"]').text()).toContain("9");
  expect(wrapper.get('[data-slot="line-chart-scale"]').text()).toContain("4");
  expect(wrapper.find('[data-slot="line-chart-current"]').exists()).toBe(true);
  expect(wrapper.get('[data-slot="line-chart-labels"]').text()).toContain(
    "Fri",
  );
  expect(wrapper.get('[data-slot="line-chart-labels"]').text()).toContain(
    "Mon",
  );
  expect(wrapper.get('[data-slot="line-chart-labels"]').text()).toContain(
    "Thu",
  );
  expect(wrapper.get('[data-slot="line-chart-values"]').text()).toContain(
    "Friday, 4 signups",
  );
  expect(
    wrapper.findAll('[data-slot="line-chart-values"] [role="listitem"]'),
  ).toHaveLength(7);
  expect(wrapper.findAll('[data-slot="line-chart-hit"]')).toHaveLength(7);
  expect(wrapper.get('[data-slot="line-chart-hit"]').attributes("type")).toBe(
    "button",
  );
  expect(
    wrapper.get('[data-slot="line-chart-hit"]').attributes("aria-label"),
  ).toBe("Inspect Friday, 4 signups");
  expect(wrapper.get('[data-slot="line-chart-tip"]').text()).toBe(
    "Friday, 4 signups",
  );
});

test("uses caller formatting without assuming a locale", () => {
  const wrapper = mount(LineChart, {
    props: {
      data: [{ label: "Heute", value: 1200.5 }],
      caption: "Umsatz",
      formatValue: (value) => `${value.toLocaleString("de-DE")} €`,
    },
  });

  expect(wrapper.get('[data-slot="line-chart-values"]').text()).toContain(
    "Heute: 1.200,5 €",
  );
});

test("handles empty, one-point, flat, missing, zero, and negative data", async () => {
  const wrapper = mount(LineChart, {
    props: { data: [], caption: "Capacity", emptyLabel: "No samples yet" },
  });

  expect(wrapper.find("svg").exists()).toBe(false);
  expect(wrapper.get('[data-slot="line-chart-empty"]').text()).toBe(
    "No samples yet",
  );

  await wrapper.setProps({ data: [{ label: "Now", value: 0 }] });
  expect(wrapper.findAll('[data-slot="line-chart-point"]')).toHaveLength(1);
  expect(wrapper.html()).not.toMatch(/NaN|Infinity/);

  await wrapper.setProps({
    data: [
      { label: "A", value: -5 },
      { label: "B", value: -5 },
      { label: "C", value: undefined },
      { label: "D", value: 0 },
      { label: "E", value: 10 },
    ],
  });
  expect(wrapper.findAll('[data-slot="line-chart-line"]')).toHaveLength(2);
  expect(wrapper.html()).not.toMatch(/NaN|Infinity/);
  expect(wrapper.get('[data-slot="line-chart-values"]').text()).toContain(
    "C: No samples yet",
  );
});

test("merges ordinary Tailwind on the chart roots", () => {
  const line = mount(LineChart, {
    props: { data: signups, caption: "Signups" },
    attrs: { class: "h-80 text-blue-700 dark:text-blue-300" },
  });

  expect(line.classes()).toContain("h-80");
  expect(line.classes()).toContain("text-blue-700");
  expect(line.classes()).not.toContain("h-56");
  expect(line.classes()).not.toContain("text-gray-950");
});

test("ships equivalent framework-native chart source without a chart runtime", () => {
  for (const [component, filename] of [
    ["sparkline", "Sparkline"],
    ["line-chart", "LineChart"],
  ]) {
    expect(registrySource(component, "vue", `${filename}.vue`)).toBe(
      readFileSync(resolve(`src/vue/${component}/${filename}.vue`), "utf8"),
    );

    expect(() =>
      parse(registrySource(component, "react", `${filename}.jsx`), {
        sourceType: "module",
        plugins: ["jsx"],
      }),
    ).not.toThrow();

    const result = compile(
      registrySource(component, "svelte", `${filename}.svelte`),
      { filename: `${filename}.svelte`, generate: false },
    );
    expect(result.warnings).toEqual([]);

    for (const framework of ["vue", "react", "svelte"]) {
      const extension = framework === "react" ? "jsx" : framework;
      const source = registrySource(
        component,
        framework,
        `${filename}.${extension}`,
      );
      expect(source).toContain("currentColor");
      expect(source).not.toMatch(
        /recharts|chart\.js|d3-|localStorage|sessionStorage|URLSearchParams/i,
      );
      expect(source).not.toMatch(/\bvariant\b|colorClass|lineClass/);
    }
  }
});
