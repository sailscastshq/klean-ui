import { useId, useState } from "react";
import RichText from "../../registry/rich-text/react/RichText.jsx";

const HTML =
  "<h2>A little context goes a long way</h2><p>Describe the work, share a useful link, and make the next step clear.</p><ul><li>Keep the details together.</li><li>Make it easy for someone else to pick up.</li></ul>";
const MARKDOWN =
  "## Ready for the next release\n\nThe new dashboard is **ready for review**.\n\n- Check the deployment notes\n- Share feedback with the team\n\n[View the project](https://sailscasts.com)\n";
const UNSUPPORTED =
  "---\ntitle: Release notes\n---\n\n## Deployment checklist\n\n- [x] Review the changes\n- [ ] Deploy to production\n\n| Service | Status |\n| --- | --- |\n| API | Ready |\n";
const BUTTON =
  "cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-gray-700 dark:hover:bg-gray-900";

function RichTextExample({
  format = "html",
  initialValue,
  required = false,
  disabled = false,
  readOnly = false,
  placeholder = "Write something worth sharing…",
  form = false,
  custom = false,
  className = "",
}) {
  const id = useId();
  const [value, setValue] = useState(
    initialValue ?? (format === "markdown" ? MARKDOWN : HTML),
  );
  const [saved, setSaved] = useState(null);
  const editor = (
    <RichText
      id={id}
      name="body"
      value={value}
      onValueChange={setValue}
      format={format}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      className={className}
      aria-describedby={`${id}-help`}
      renderToolbar={
        custom
          ? ({ editor, mode, setMode }) => (
              <div className="flex flex-wrap items-center gap-2 p-2">
                <button
                  type="button"
                  className={BUTTON}
                  disabled={!editor || mode !== "visual"}
                  aria-pressed={editor?.isActive("bold") ?? false}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  Bold
                </button>
                <button
                  type="button"
                  className={BUTTON}
                  onClick={() =>
                    setMode(mode === "source" ? "visual" : "source")
                  }
                >
                  {mode === "source" ? "Write" : "Source"}
                </button>
              </div>
            )
          : undefined
      }
    />
  );
  const content = (
    <>
      <label htmlFor={id} className="text-sm font-medium">
        {format === "markdown" ? "Release notes" : "Project description"}
      </label>
      {editor}
      <p id={`${id}-help`} className="text-sm text-gray-500">
        {readOnly
          ? "Read-only content can still be selected and copied."
          : "Write comfortably, or edit the source directly."}
      </p>
      {form && (
        <div className="flex gap-2">
          <button type="submit" className={BUTTON}>
            Save description
          </button>
          <button type="reset" className={BUTTON}>
            Reset
          </button>
        </div>
      )}
      {saved !== null && (
        <output className="block max-h-48 overflow-auto rounded-md bg-gray-100 p-3 font-mono text-xs whitespace-pre-wrap wrap-break-word dark:bg-gray-900">
          {saved}
        </output>
      )}
    </>
  );
  return form ? (
    <form
      className="grid w-[min(44rem,calc(100vw-2rem))] gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(String(new FormData(event.currentTarget).get("body") ?? ""));
      }}
    >
      {content}
    </form>
  ) : (
    <div className="grid w-[min(44rem,calc(100vw-2rem))] gap-3">{content}</div>
  );
}

export default {
  title: "Components/Rich Text",
  component: RichTextExample,
  parameters: { layout: "centered" },
  args: { format: "html", disabled: false, readOnly: false, required: false },
};

export const Playground = {};
export const Markdown = { args: { format: "markdown" } };
export const Source = {
  args: { format: "markdown", initialValue: UNSUPPORTED },
};
export const Form = { args: { initialValue: "", required: true, form: true } };
export const ReadOnly = { args: { readOnly: true } };
export const Disabled = { args: { disabled: true } };
export const CustomToolbar = { args: { custom: true } };
