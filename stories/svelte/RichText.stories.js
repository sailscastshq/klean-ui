import RichTextExample from "./RichTextExample.svelte";

export default {
  title: "Components/Rich Text",
  component: RichTextExample,
  parameters: { layout: "centered" },
  args: { format: "html", disabled: false, readonly: false, required: false },
};

export const Playground = {};
export const Markdown = { args: { format: "markdown" } };
export const Source = {
  args: {
    format: "markdown",
    initialValue:
      "---\ntitle: Release notes\n---\n\n## Deployment checklist\n\n- [x] Review the changes\n- [ ] Deploy to production\n\n| Service | Status |\n| --- | --- |\n| API | Ready |\n",
  },
};
export const Form = { args: { initialValue: "", required: true, form: true } };
export const ReadOnly = { args: { readonly: true } };
export const Disabled = { args: { disabled: true } };
export const CustomToolbar = { args: { custom: true } };
