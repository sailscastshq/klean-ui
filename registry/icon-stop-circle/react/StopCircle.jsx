import { forwardRef } from "react";

const StopCircle = forwardRef(function StopCircle(props, ref) {
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
      <circle cx="12" cy="12" r="8.25" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
});

export default StopCircle;
