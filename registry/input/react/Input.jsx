import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { mergeDescribedBy, useFieldContext } from "../field/field-context.js";

const BASE_CLASSES = [
  "block min-h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-950 shadow-sm outline-none transition-colors duration-150",
  "placeholder:text-gray-500 hover:border-gray-400",
  "focus-visible:border-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950",
  "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
  "aria-invalid:border-red-600 aria-invalid:focus-visible:outline-red-600",
  "dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-400 dark:hover:border-gray-600 dark:focus-visible:border-white dark:focus-visible:outline-white dark:disabled:bg-gray-900 dark:disabled:text-gray-500 dark:aria-invalid:border-red-500 dark:aria-invalid:focus-visible:outline-red-500",
  "motion-reduce:transition-none",
];

const Input = forwardRef(function Input(
  {
    id,
    name,
    type = "text",
    disabled,
    required,
    className,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const field = useFieldContext();
  const resolvedDisabled = disabled ?? field?.disabled ?? false;
  const resolvedInvalid = ariaInvalid ?? (field?.invalid ? true : undefined);

  return (
    <input
      {...props}
      ref={ref}
      id={field?.controlId ?? id}
      name={name ?? field?.name}
      type={type}
      disabled={resolvedDisabled}
      required={required ?? field?.required ?? false}
      aria-invalid={resolvedInvalid}
      aria-describedby={mergeDescribedBy(ariaDescribedBy, field?.describedBy)}
      data-invalid={
        resolvedInvalid === true || resolvedInvalid === "true" ? "" : undefined
      }
      data-disabled={resolvedDisabled ? "" : undefined}
      data-slot="input"
      className={twMerge(BASE_CLASSES, className)}
    />
  );
});

export default Input;
