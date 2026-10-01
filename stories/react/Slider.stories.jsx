import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Slider from "../../registry/slider/react/Slider.jsx";

function Examples() {
  const [rollout, setRollout] = useState(40);
  const [budget, setBudget] = useState([20, 80]);
  const [effort, setEffort] = useState(2);
  const [commits, setCommits] = useState(0);
  return (
    <form
      className="w-full max-w-lg space-y-8 p-6"
      onSubmit={(event) => event.preventDefault()}
    >
      <section>
        <label htmlFor="rollout" className="font-medium">
          Rollout
        </label>
        <output className="float-end">{rollout}%</output>
        <Slider
          id="rollout"
          name="rollout"
          value={rollout}
          onChange={setRollout}
          onCommit={() => setCommits((count) => count + 1)}
          valueText={(value) => `${value} percent`}
        />
        <p>
          Committed adjustments:{" "}
          <output aria-label="Commit count">{commits}</output>
        </p>
      </section>
      <section>
        <h2 id="budget-label" className="font-medium">
          Budget
        </h2>
        <output>{budget.join(" – ")}</output>
        <Slider
          value={budget}
          onChange={setBudget}
          minStepsBetween={5}
          name={["minimum", "maximum"]}
          aria-labelledby="budget-label"
          labels={["Minimum budget", "Maximum budget"]}
        />
      </section>
      <section>
        <h2 className="font-medium">Thinking effort</h2>
        <output>
          {["", "Low", "Medium", "High", "Very high", "Ultra"][effort]}
        </output>
        <Slider
          value={effort}
          onChange={setEffort}
          min={1}
          max={5}
          marks={[2, 3, 4]}
          aria-label="Thinking effort"
          className={`h-16 [--thumb-size:3.5rem] **:data-[slot=slider-track]:h-12 **:data-[slot=slider-mark]:size-2 ${effort === 5 ? "text-violet-600 **:data-[slot=slider-fill]:bg-[linear-gradient(90deg,#2563eb,#a78bfa,#7c3aed)] **:data-[slot=slider-mark]:opacity-0" : "text-blue-500"}`}
        />
      </section>
      <Slider defaultValue={30} disabled aria-label="Unavailable" />
      <fieldset disabled>
        <legend>Unavailable form section</legend>
        <Slider defaultValue={20} aria-label="Disabled by fieldset" />
      </fieldset>
      <div dir="rtl">
        <Slider defaultValue={40} aria-label="RTL value" />
      </div>
      <button
        type="reset"
        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2"
      >
        Reset
      </button>
    </form>
  );
}

export default {
  title: "Components/Slider",
  component: Slider,
  parameters: { layout: "centered" },
};
export const Playground = { render: () => <Examples /> };
export const Keyboard = {
  render: () => <Examples />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("slider", { name: "Rollout" });
    input.focus();
    await userEvent.keyboard("{PageUp}");
    await expect(input).toHaveValue("50");
    const minimum = canvas.getByRole("slider", { name: "Minimum budget" });
    minimum.focus();
    await userEvent.keyboard("{End}");
    await expect(minimum).toHaveValue("75");
    await userEvent.tab();
    await expect(
      canvas.getByRole("slider", { name: "Maximum budget" }),
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(input).toHaveValue("40");
    await expect(minimum).toHaveValue("20");
    await expect(
      canvas.getByRole("slider", { name: "Maximum budget" }),
    ).toHaveValue("80");
    await expect(
      canvas.getByRole("slider", { name: "Thinking effort" }),
    ).toHaveValue("2");
    await expect(
      canvas.getByRole("slider", { name: "Unavailable" }),
    ).toHaveValue("30");
  },
};
