import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { useFieldContext } from "../field/field-context.js";

const Label = forwardRef(function Label(
  { htmlFor, className, children, ...props },
  ref,
) {
  const field = useFieldContext();

  return (
    <label
      {...props}
      ref={ref}
      htmlFor={field?.controlId ?? htmlFor}
      data-slot="label"
      data-disabled={field?.disabled ? "" : undefined}
      className={twMerge(
        "block text-sm font-medium leading-6 text-gray-950 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 dark:text-white",
        className,
      )}
    >
      {children}
    </label>
  );
});

export default Label;
