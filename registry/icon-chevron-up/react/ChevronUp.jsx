import { forwardRef } from "react";

const ChevronUp = forwardRef(function ChevronUp(props, ref) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-slot="icon"
      {...props}
      ref={ref}
    >
      <path d="m6.25 15.25 5.75-6.5 5.75 6.5" />
    </svg>
  );
});

export default ChevronUp;
