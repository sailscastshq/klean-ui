import FileUploadExample from "./FileUploadExample.svelte";
import FileUploadHagfish from "./FileUploadHagfish.svelte";

const meta = {
  title: "Components/FileUpload",
  component: FileUploadExample,
  parameters: { layout: "centered" },
  args: {
    accept: "image/png,image/jpeg,.pdf",
    disabled: false,
    maxKb: 2048,
  },
  argTypes: {
    accept: { control: "text" },
    disabled: { control: "boolean" },
    maxKb: { control: { type: "number", min: 1, step: 1 } },
  },
};

export default meta;

export const Playground = {};

export const Hagfish = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({ Component: FileUploadHagfish }),
};
