import { forwardRef } from "react";

const Terminal = forwardRef(function Terminal(props, ref) {
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
      <rect x="3.75" y="4.5" width="16.5" height="15" rx="2.25" />
      <path d="m7.25 9 3 3-3 3M12.75 15H17" />
    </svg>
  );
});

export default Terminal;
