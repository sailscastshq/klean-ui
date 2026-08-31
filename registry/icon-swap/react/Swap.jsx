import { forwardRef } from "react";

const Swap = forwardRef(function Swap(props, ref) {
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
      <path d="M4.5 8.25h13m-3.5-3.5 3.5 3.5-3.5 3.5M19.5 15.75h-13m3.5 3.5-3.5-3.5 3.5-3.5" />
    </svg>
  );
});

export default Swap;
