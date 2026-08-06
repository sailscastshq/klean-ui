import { expect, test } from "@rstest/core";
import inputMeta, {
  Playground as InputPlayground,
} from "../stories/Input.stories.js";
import textareaMeta, {
  Playground as TextareaPlayground,
} from "../stories/Textarea.stories.js";

const usefulControls = [
  "label",
  "help",
  "error",
  "placeholder",
  "disabled",
  "required",
];

test("keeps form playground controls focused on useful visible state", () => {
  expect(InputPlayground.parameters.controls.include).toEqual(usefulControls);
  expect(TextareaPlayground.parameters.controls.include).toEqual(
    usefulControls,
  );
});

test("keeps story composition out of the component-level API", () => {
  for (const meta of [inputMeta, textareaMeta]) {
    expect(meta.args).not.toHaveProperty("label");
    expect(meta.args).not.toHaveProperty("help");
    expect(meta.args).not.toHaveProperty("error");
  }
});
