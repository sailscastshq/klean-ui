import { forwardRef, useId, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { FieldContext } from "./field-context.js";

const LABEL_CLASSES =
  "block text-sm font-medium leading-6 text-gray-950 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 dark:text-white";

const Field = forwardRef(function Field(
  {
    id,
    name,
    label,
    description,
    error,
    invalid,
    disabled = false,
    required = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const resolvedInvalid = invalid ?? Boolean(error);
  const describedBy =
    [
      description !== undefined ? descriptionId : undefined,
      error !== undefined ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const context = useMemo(
    () => ({
      controlId,
      name,
      invalid: resolvedInvalid,
      disabled,
      required,
      describedBy,
    }),
    [controlId, name, resolvedInvalid, disabled, required, describedBy],
  );

  return (
    <FieldContext.Provider value={context}>
      <div
        {...props}
        ref={ref}
        data-slot="field"
        data-invalid={resolvedInvalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={twMerge("grid gap-2", className)}
      >
        <label
          htmlFor={controlId}
          data-slot="label"
          data-disabled={disabled ? "" : undefined}
          className={LABEL_CLASSES}
        >
          {label}
        </label>
        {children}
        {description !== undefined ? (
          <p
            id={descriptionId}
            data-slot="field-description"
            className="text-sm leading-6 text-gray-600 dark:text-gray-400"
          >
            {description}
          </p>
        ) : null}
        {error !== undefined ? (
          <p
            id={errorId}
            data-slot="field-error"
            className="text-sm leading-6 text-red-700 dark:text-red-400"
          >
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
});

export default Field;
