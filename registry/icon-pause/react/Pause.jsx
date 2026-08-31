import { forwardRef } from "react";

const Pause = forwardRef(function Pause(props, ref) {
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
      <rect x="7" y="5" width="3.25" height="14" rx="1" />
      <rect x="13.75" y="5" width="3.25" height="14" rx="1" />
    </svg>
  );
});

export default Pause;
