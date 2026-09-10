import { useState } from "react";
import Chips from "../../registry/chips/react/Chips.jsx";
export default {
  title: "Components/Chips",
  component: Chips,
  parameters: { layout: "centered" },
};
export const Playground = {
  render: function Example() {
    const [value, setValue] = useState(["Design", "Build"]);
    return (
      <div className="w-80">
        <label htmlFor="chips-demo">Steps</label>
        <Chips
          id="chips-demo"
          value={value}
          onValueChange={setValue}
          placeholder="Add value, press Enter"
          className="border-b border-dashed p-2"
        />
      </div>
    );
  },
};
