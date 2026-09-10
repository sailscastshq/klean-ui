import { useId, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export default function Chips({
  value = [],
  onValueChange,
  normalizeValue = (value) => value.trim(),
  formatValue = (value) => value,
  maxItems = 100,
  disabled,
  readOnly,
  required,
  className,
  onBlur,
  ...attrs
}) {
  const [draft, setDraft] = useState(""),
    [message, setMessage] = useState("");
  const input = useRef(null),
    errorId = `chips-${useId()}-error`;
  function add() {
    if (disabled || readOnly || !draft.trim()) return;
    try {
      const next = normalizeValue(draft);
      if (!next) throw new Error("Enter a value.");
      if (value.includes(next)) throw new Error("This value is already added.");
      if (value.length >= maxItems)
        throw new Error(`Use at most ${maxItems} values.`);
      onValueChange?.([...value, next]);
      setDraft("");
      setMessage("");
      input.current?.setCustomValidity("");
    } catch (error) {
      setMessage(error.message || "Enter a valid value.");
      input.current?.setCustomValidity(error.message || "Enter a valid value.");
    }
  }
  function remove(index) {
    if (disabled || readOnly) return;
    onValueChange?.(value.filter((_, i) => i !== index));
    setMessage("");
    input.current?.setCustomValidity("");
    input.current?.focus();
  }
  return (
    <div
      data-slot="chips"
      className={twMerge(
        "flex min-h-11 flex-wrap items-center gap-2",
        className,
      )}
    >
      {value.map((item, index) => (
        <span
          key={item}
          data-slot="chip"
          className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-950 dark:bg-gray-800 dark:text-white"
        >
          <span className="min-w-0 wrap-break-word">{formatValue(item)}</span>
          {!readOnly && (
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${formatValue(item)}`}
              className="grid size-6 shrink-0 place-items-center rounded hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 dark:hover:bg-gray-700"
              onClick={() => remove(index)}
            >
              ×
            </button>
          )}
        </span>
      ))}
      <input
        {...attrs}
        ref={input}
        value={draft}
        type="text"
        disabled={disabled}
        readOnly={readOnly}
        required={required && !value.length}
        aria-invalid={message ? "true" : attrs["aria-invalid"]}
        aria-describedby={
          [attrs["aria-describedby"], message && errorId]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className="min-w-48 flex-1 border-0 bg-transparent py-1 text-sm outline-none disabled:cursor-not-allowed"
        onChange={(e) => {
          setDraft(e.target.value);
          setMessage("");
          e.target.setCustomValidity("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            add();
          }
        }}
        onBlur={(e) => {
          add();
          onBlur?.(e);
        }}
      />
      {message && (
        <span
          id={errorId}
          role="alert"
          className="w-full text-sm text-red-600 dark:text-red-400"
        >
          {message}
        </span>
      )}
    </div>
  );
}
