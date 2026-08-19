import { useState } from "react";
import TagsInput from "../../registry/tags-input/react/TagsInput.jsx";

function TagsInputExample({ placeholder, disabled, readOnly, max, className }) {
  const [tags, setTags] = useState(["billing", "invoice"]);
  const [draft, setDraft] = useState("");

  return (
    <div className="grid w-[min(34rem,calc(100vw-2rem))] gap-2">
      <label htmlFor="react-tags" className="text-sm font-medium">
        Tags
      </label>
      <TagsInput
        id="react-tags"
        value={tags}
        onChange={setTags}
        draft={draft}
        onDraftChange={setDraft}
        name="tags"
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        max={max}
        className={className}
        aria-describedby="react-tags-help"
      />
      <p id="react-tags-help" className="text-sm text-gray-500">
        Enter, comma, blur, and bulk paste all commit ordinary tags.
      </p>
    </div>
  );
}

const meta = {
  title: "Components/Tags Input",
  component: TagsInputExample,
  parameters: { layout: "centered" },
  args: {
    placeholder: "Add a tag",
    disabled: false,
    readOnly: false,
    max: 5,
    className: "",
  },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    max: { control: { type: "number", min: 1, max: 12 } },
    className: { control: "text" },
  },
};

export default meta;
export const Playground = {};

export const DurableDraft = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [tags, setTags] = useState(["customer"]);
    const [draft, setDraft] = useState("follow up");
    return (
      <div className="grid w-[min(34rem,calc(100vw-2rem))] gap-2">
        <label htmlFor="react-restored-tags" className="text-sm font-medium">
          Restored labels
        </label>
        <TagsInput
          id="react-restored-tags"
          value={tags}
          onChange={setTags}
          draft={draft}
          onDraftChange={setDraft}
        />
        <p className="text-sm text-gray-500">
          Committed tags and pending text are both caller-owned.
        </p>
      </div>
    );
  },
};
